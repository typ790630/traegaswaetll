import { useEffect, useRef, useState, useCallback } from "react"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Button } from "./ui/button"
import { X, Image as ImageIcon, Camera } from "lucide-react"
import { useTranslation } from "react-i18next"

interface QrScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const { t } = useTranslation()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const startScanning = useCallback(async () => {
    try {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader", {
                verbose: false,
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            })
        }

        // ✅ 修复：检查扫描器状态，避免重复启动
        if (scannerRef.current.isScanning) {
            console.log('[QrScanner] Already scanning, stopping first...')
            await scannerRef.current.stop()
            await new Promise(resolve => setTimeout(resolve, 100)) // 等待停止完成
        }

        await scannerRef.current.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            (decodedText) => {
                onScan(decodedText)
            },
            (errorMessage) => {
                // ignore
            }
        )
        setIsScanning(true)
        setHasPermission(true)
        setError("")
    } catch (err: any) {
        console.error("Failed to start scanner", err)
        setHasPermission(false)
        setIsScanning(false)
        // 忽略状态转换错误（非关键）
        if (!err.message?.includes('transition')) {
            setError(err.message || 'Failed to start camera')
        }
    }
  }, [onScan])

  const stopScanning = useCallback(async () => {
      if (scannerRef.current && isScanning) {
          try {
              await scannerRef.current.stop()
              setIsScanning(false)
          } catch (err) {
              console.error("Failed to stop scanner", err)
          }
      }
  }, [isScanning])

  useEffect(() => {
    // Start scanning on mount
    const timer = setTimeout(() => {
        startScanning()
    }, 100)

    return () => {
        clearTimeout(timer)
        // ✅ 修复：优化清理逻辑
        if (scannerRef.current) {
            const cleanup = async () => {
                try {
                    if (scannerRef.current?.isScanning) {
                        await scannerRef.current.stop()
                    }
                    await scannerRef.current?.clear()
                } catch (err) {
                    // 忽略清理错误
                    console.log('[QrScanner] Cleanup error (ignored):', err)
                }
            }
            cleanup()
        }
    }
  }, [startScanning])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0]
          try {
              if (!scannerRef.current) {
                  scannerRef.current = new Html5Qrcode("reader", {
                    verbose: false,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                  })
              }
              
              // ✅ 修复：如果正在扫描，先停止
              if (scannerRef.current.isScanning) {
                  await scannerRef.current.stop()
                  setIsScanning(false)
              }
              
              const result = await scannerRef.current.scanFile(file, true)
              onScan(result)
          } catch (err) {
              console.error("Failed to scan file", err)
              setError(t('qrScanner.error', 'Failed to scan image'))
          }
      }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </Button>
      
      <div className="w-full max-w-md bg-black flex flex-col items-center">
        <h2 className="text-white text-center mb-8 text-xl font-bold tracking-wide">{t('qrScanner.title', 'Scan QR Code')}</h2>
        
        <div className="relative w-full aspect-square max-w-[300px] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div id="reader" className="w-full h-full [&_video]:object-cover" />
            
            {/* Overlay for scanning frame */}
            {isScanning && (
                <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-lg animate-pulse pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary -mt-0.5 -ml-0.5"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary -mt-0.5 -mr-0.5"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary -mb-0.5 -ml-0.5"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary -mb-0.5 -mr-0.5"></div>
                </div>
            )}

            {/* Permission / Error State */}
            {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900">
                    <Camera className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/60 text-sm mb-6">
                        {error || t('qrScanner.permissionDenied', 'Camera access needed')}
                    </p>
                    <Button onClick={startScanning} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        {t('qrScanner.requestPermission', 'Request Camera Permissions')}
                    </Button>
                </div>
            )}
        </div>
        
        <p className="text-white/40 text-center mt-8 text-sm font-medium">
            {t('qrScanner.instruction', 'Align the QR code within the frame to scan')}
        </p>

        {/* Scan from Image Button */}
        <div className="mt-8">
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />
            <Button 
                variant="link" 
                className="text-white/60 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
            >
                <ImageIcon className="w-4 h-4 mr-2" />
                <span className="underline decoration-1 underline-offset-4">
                    {t('qrScanner.scanImage', 'Scan an Image File')}
                </span>
            </Button>
        </div>
      </div>
    </div>
  )
}