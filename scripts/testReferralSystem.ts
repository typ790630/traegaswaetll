// Test Script for Referral System Logic
// Run with: npx ts-node scripts/testReferralSystem.ts
// Note: Requires ts-node installed or run in environment supporting TS execution

import { ReferralService } from '../src/services/ReferralService';

async function runTest() {
  console.log("🚀 Starting Referral System Simulation...\n");

  // 1. Create two users
  const referrerAddr = "0x" + "1".repeat(40); // User A (Referrer)
  const userAddr = "0x" + "2".repeat(40);     // User B (Invitee)

  console.log(`Creating User A (Referrer): ${referrerAddr.substring(0, 8)}...`);
  console.log(`Creating User B (Invitee):  ${userAddr.substring(0, 8)}...`);

  ReferralService.initUser(referrerAddr);
  ReferralService.initUser(userAddr);

  // 2. Initial State Check
  let referrerData = await ReferralService.getData(referrerAddr);
  console.log(`\n[Initial] Referrer Invite Count: ${referrerData.inviteCount}`);
  
  // 3. Bind Referrer
  console.log(`\n🔄 User B binding User A as referrer...`);
  const bindResult = await ReferralService.bindReferrer(userAddr, referrerAddr);
  
  if (bindResult.success) {
      console.log(`✅ Bind Successful! TxHash: ${bindResult.txHash}`);
  } else {
      console.error(`❌ Bind Failed: ${bindResult.error}`);
      return;
  }

  // 4. Verify Referrer Stats Update
  referrerData = await ReferralService.getData(referrerAddr);
  console.log(`[Update] Referrer Invite Count: ${referrerData.inviteCount} (Expected: 1)`);
  console.log(`[Update] Referrer Total Rewards: ${referrerData.totalRewards} (Expected: > 0)`);
  
  if (referrerData.inviteCount === 1) {
      console.log("✅ Referrer stats updated correctly.");
  } else {
      console.error("❌ Referrer stats failed to update.");
  }

  // 5. Try to Claim Reward (Should fail due to low balance)
  console.log(`\n🔄 User B attempting to claim reward (Balance: 0)...`);
  ReferralService.debugSetBalance(userAddr, 50); // Set low balance
  let claimResult = await ReferralService.claimReward(userAddr);
  
  if (!claimResult.success && claimResult.error === "Insufficient balance") {
      console.log("✅ Claim correctly rejected due to low balance.");
  } else {
      console.error("❌ Claim logic failed (Should reject).");
  }

  // 6. Top up and Claim
  console.log(`\n💰 User B topping up to 250 RADRS...`);
  ReferralService.debugSetBalance(userAddr, 250);
  
  console.log(`🔄 User B attempting to claim reward again...`);
  claimResult = await ReferralService.claimReward(userAddr);
  
  if (claimResult.success) {
      console.log(`✅ Claim Successful! TxHash: ${claimResult.txHash}`);
      const newBalance = await ReferralService.getBalance(userAddr);
      console.log(`[Update] User B Balance: ${newBalance} (Expected: 255)`);
      
      if (newBalance === 255) {
          console.log("✅ Balance updated correctly.");
      } else {
          console.error("❌ Balance update failed.");
      }
  } else {
      console.error(`❌ Claim Failed: ${claimResult.error}`);
  }

  console.log("\n✨ Simulation Complete!");
}

runTest().catch(console.error);
