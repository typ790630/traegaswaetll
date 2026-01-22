/**
 * ⚠️⚠️⚠️ DEPRECATED - 此文件已废弃 ⚠️⚠️⚠️
 * 
 * 本文件包含 Account Abstraction (AA) 相关代码，已不再使用。
 * 当前钱包架构：Pure EOA（纯 EOA 钱包）
 * 
 * 废弃原因：
 * 1. 钱包已改为纯 EOA 架构
 * 2. 所有交易直接用 EOA 私钥签名
 * 3. Gas 费用 BNB 支付（不使用 Paymaster）
 * 
 * 迁移完成日期：2026-01-22
 * 
 * ⚠️ 不要在新代码中使用此 Service！
 * ⚠️ 所有推荐系统功能已迁移到 ReferralService（EOA 版本）
 */

import { createPublicClient, http, Hex, encodeFunctionData, parseAbi, formatEther } from 'viem'
import { bsc } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { createSmartAccountClient } from 'permissionless'
import { toSimpleSmartAccount } from 'permissionless/accounts'
import { RADRS_CONFIG, REFERRAL_ABI, ERC20_ABI } from '../config/radrs'

const publicClient = createPublicClient({
  chain: bsc,
  transport: http(RADRS_CONFIG.rpcUrl)
})

export const AAService = {
  /**
   * Generates a signer account from a private key.
   * @param privateKey - The EOA private key.
   */
  getSigner: (privateKey: Hex) => {
    return privateKeyToAccount(privateKey)
  },

  /**
   * Creates a Smart Account Client for the given signer.
   * @param signer - The EOA signer.
   */
  createClient: async (signer: any, usePaymaster: boolean = true) => {
    const simpleAccount = await toSimpleSmartAccount({
      client: publicClient,
      owner: signer,
      entryPoint: {
        address: RADRS_CONFIG.entryPointAddress as `0x${string}`,
        version: "0.6"
      },
      factoryAddress: RADRS_CONFIG.factoryAddress as `0x${string}`,
    })

    // Custom Paymaster Client for RADRS Paymaster API
    // Supports fallback to user-paid mode if Paymaster fails
    const customPaymasterClient = {
      sponsorUserOperation: async ({ userOperation }: { userOperation: any }) => {
        try {
          const response = await fetch(RADRS_CONFIG.paymasterApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              chainId: RADRS_CONFIG.chainId, 
              userOp: userOperation 
            })
          })
          
          if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
             throw new Error(errorData.message || 'Paymaster request failed')
          }

          const data = await response.json()
          
          // RADRS Paymaster returns custom fields
          // Note: The paymaster server already calculates the required gas and fees
          // based on real-time network conditions and token prices.
          // We trust the paymaster's response for gas limits and paymasterAndData.
          
          console.log('[AAService] ✅ Paymaster sponsorship succeeded')
          
          return {
            paymasterAndData: data.paymasterAndData,
            callGasLimit: data.callGasLimit 
                ? BigInt(data.callGasLimit) 
                : (data.paymasterPostOpGasLimit ? BigInt(data.paymasterPostOpGasLimit) : userOperation.callGasLimit),
            verificationGasLimit: data.verificationGasLimit 
                ? BigInt(data.verificationGasLimit) 
                : (data.paymasterVerificationGasLimit ? BigInt(data.paymasterVerificationGasLimit) : userOperation.verificationGasLimit),
            preVerificationGas: data.preVerificationGas 
                ? BigInt(data.preVerificationGas) 
                : userOperation.preVerificationGas,
          }
        } catch (error) {
           console.warn("[AAService] ⚠️ Paymaster sponsorship failed, will fallback to user-paid mode:", error)
           throw error // Throw to trigger fallback in the caller
        }
      }
    }

    console.log('[AAService] Using Bundler URL:', RADRS_CONFIG.bundlerUrl) // Debug Log

    const smartAccountClient = createSmartAccountClient({
      account: simpleAccount,
      chain: bsc,
      bundlerTransport: http(RADRS_CONFIG.bundlerUrl),
      middleware: usePaymaster ? {
        sponsorUserOperation: customPaymasterClient.sponsorUserOperation
      } : undefined // No middleware means native gas payment
    })

    return smartAccountClient
  },

  /**
   * Approves Paymaster to spend RADRS tokens for Gas.
   * @param signer - The EOA signer.
   * @param amount - Amount to approve.
   */
  approvePaymaster: async (signer: any, amount: bigint) => {
    const client = await AAService.createClient(signer)
    
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [RADRS_CONFIG.paymasterAddress, amount]
    })

    const txHash = await client.sendTransaction({
      to: RADRS_CONFIG.radrsTokenAddress as `0x${string}`,
      data: approveData,
      value: 0n
    })

    return txHash
  },

  /**
   * Binds a referrer on-chain using a UserOperation.
   * @param signer - The EOA signer.
   * @param referrerAddress - The address of the referrer.
   */
  bindReferrer: async (signer: any, referrerAddress: string) => {
    const client = await AAService.createClient(signer)
    
    const callData = encodeFunctionData({
      abi: REFERRAL_ABI,
      functionName: 'bindReferrer',
      args: [referrerAddress]
    })

    const txHash = await client.sendTransaction({
      to: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
      data: callData,
      value: 0n
    })

    return txHash
  },

  /**
   * Claims rewards on-chain using a UserOperation.
   * @param signer - The EOA signer.
   */
  claimReward: async (signer: any) => {
    const client = await AAService.createClient(signer)
    
    const callData = encodeFunctionData({
      abi: REFERRAL_ABI,
      functionName: 'claimReward',
      args: []
    })

    const txHash = await client.sendTransaction({
      to: RADRS_CONFIG.referralRegistryAddress as `0x${string}`,
      data: callData,
      value: 0n
    })

    return txHash
  },

  /**
   * Sends a native token transfer (BNB/ETH) using a UserOperation.
   * @param signer - The EOA signer.
   * @param to - The recipient address.
   * @param amount - The amount to send (in wei).
   */
  sendNative: async (signer: any, to: string, amount: bigint) => {
    try {
        // 1. Try with Paymaster
        const client = await AAService.createClient(signer, true)
        
        const txHash = await client.sendTransaction({
            to: to as `0x${string}`,
            data: '0x',
            value: amount
        })
        console.log('Native Transfer Sent (Paymaster)')
        return txHash
    } catch (e) {
        console.warn("Paymaster native transfer failed, falling back to Native Gas", e)
        
        // 2. Fallback: Native Gas
        const client = await AAService.createClient(signer, false)
        
        const txHash = await client.sendTransaction({
            to: to as `0x${string}`,
            data: '0x',
            value: amount
        })
        console.log('Native Transfer Sent (Native Gas Fallback)')
        return txHash
    }
  },

  /**
   * Sends an ERC20 transfer using a UserOperation.
   * @param signer - The EOA signer.
   * @param tokenAddress - The token contract address.
   * @param to - The recipient address.
   * @param amount - The amount to send (in wei).
   */
  sendToken: async (signer: any, tokenAddress: string, to: string, amount: bigint) => {
    try {
        console.log('[AAService] 🎯 Step 1: Trying with Paymaster (RADRS Gas)...')
        
        // Create client with Paymaster middleware
        const client = await AAService.createClient(signer, true)
        
        console.log('[AAService] Building batch transaction: Approve + Transfer')
        
        // Build approve and transfer calls
        const approveData = encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [RADRS_CONFIG.paymasterAddress, BigInt('10000000000000000000000')] // 10000 RADRS
        })
        
        const transferCallData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to, amount]
        })
        
        console.log('[AAService] Sending UserOperation with Paymaster...')
        
        // Send UserOperation - SDK will automatically handle Paymaster
        const userOpHash = await client.sendUserOperation({
            calls: [
                {
                    to: RADRS_CONFIG.radrsTokenAddress as `0x${string}`,
                    data: approveData,
                    value: 0n
                },
                {
                    to: tokenAddress as `0x${string}`,
                    data: transferCallData,
                    value: 0n
                }
            ]
        })
        
        console.log('[AAService] ✅ UserOperation sent with Paymaster!')
        console.log('[AAService] UserOp Hash:', userOpHash)
        
        // Wait for transaction confirmation
        console.log('[AAService] Waiting for transaction confirmation...')
        const receipt = await client.waitForUserOperationReceipt({ hash: userOpHash })
        
        console.log('[AAService] 🎉 Transaction confirmed!')
        console.log('[AAService] Transaction Hash:', receipt.receipt.transactionHash)
        
        return receipt.receipt.transactionHash

    } catch (paymasterError) {
        console.warn('[AAService] ⚠️ Paymaster failed, trying fallback with BNB...', paymasterError)
        
        try {
            console.log('[AAService] 🔄 Step 2: Fallback to BNB payment (user-paid gas)...')
            
            // Create client WITHOUT Paymaster middleware
            // This will use native BNB for gas payment
            const clientWithoutPaymaster = await AAService.createClient(signer, false)
            const aaAddress = clientWithoutPaymaster.account.address
            
            // Check BNB Balance
            const balance = await publicClient.getBalance({ address: aaAddress })
            console.log(`[AAService] 💰 AA Wallet Address: ${aaAddress}`)
            console.log(`[AAService] 💰 AA Wallet Balance: ${formatEther(balance)} BNB`)
            
            if (balance === 0n) {
                throw new Error(`Insufficient BNB balance. AA Wallet (${aaAddress}) has 0 BNB. Please deposit BNB to pay for gas.`)
            }

            // Simple transfer without batch (to reduce complexity)
            const callData = encodeFunctionData({
              abi: ERC20_ABI,
              functionName: 'transfer',
              args: [to, amount]
            })
            
            console.log('[AAService] Sending UserOperation with BNB as gas (no Paymaster)...')
            
            // Must use sendUserOperation even for BNB payment in AA wallet
            // The difference is: no Paymaster middleware = user pays with native token
            const userOpHash = await clientWithoutPaymaster.sendUserOperation({
              calls: [{
                to: tokenAddress as `0x${string}`,
                data: callData,
                value: 0n
              }]
            })
            
            console.log('[AAService] ✅ UserOperation sent with BNB!')
            console.log('[AAService] UserOp Hash:', userOpHash)
            
            // Wait for confirmation
            const receipt = await clientWithoutPaymaster.waitForUserOperationReceipt({ hash: userOpHash })
            
            console.log('[AAService] 🎉 Transaction confirmed with BNB payment!')
            console.log('[AAService] Transaction Hash:', receipt.receipt.transactionHash)
            
            return receipt.receipt.transactionHash
            
        } catch (bnbError) {
            console.error('[AAService] ❌ Both Paymaster and BNB fallback failed!')
            console.error('[AAService] Paymaster error:', paymasterError)
            console.error('[AAService] BNB error:', bnbError)
            throw new Error(`Transfer failed: Paymaster error: ${paymasterError.message}, BNB fallback error: ${bnbError.message}`)
        }
    }
  },

  /**
   * Swaps tokens using a DEX Router (PancakeSwap).
   * @param signer - The EOA signer.
   * @param routerAddress - The DEX Router address.
   * @param tokenIn - Token address to sell.
   * @param tokenOut - Token address to buy.
   * @param amountIn - Amount to sell.
   * @param amountOutMin - Minimum amount to receive.
   * @param deadline - Transaction deadline.
   */
  swapTokens: async (
    signer: any,
    routerAddress: string,
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    amountOutMin: bigint,
    deadline: bigint
  ) => {
    const executeSwap = async (usePaymaster: boolean) => {
        const client = await AAService.createClient(signer, usePaymaster)

        // 1. Approve Router to spend tokenIn
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [routerAddress, amountIn]
        })

        // 2. Swap Call
        const swapData = encodeFunctionData({
          abi: parseAbi([
            'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)'
          ]),
          functionName: 'swapExactTokensForTokens',
          args: [
            amountIn,
            amountOutMin,
            [tokenIn, tokenOut], // Path
            client.account.address, // Recipient (Self)
            deadline
          ]
        })

        // Send Batch Transaction using UserOperation
        const userOpHash = await client.sendUserOperation({
          calls: [
            {
              to: tokenIn as `0x${string}`,
              data: approveData,
              value: 0n
            },
            {
              to: routerAddress as `0x${string}`,
              data: swapData,
              value: 0n
            }
          ]
        })

        // Wait for transaction to be included
        const receipt = await client.waitForUserOperationReceipt({ hash: userOpHash })
        return receipt.receipt.transactionHash
    }

    try {
        console.log('Attempting Swap with Paymaster...')
        return await executeSwap(true)
    } catch (e) {
        console.warn('Swap with Paymaster failed, falling back to Native Gas', e)
        return await executeSwap(false)
    }
  }
}
