import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Lock, Smartphone, Check, Key } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Switch } from "../../components/ui/switch"
import { useAppStore } from "../../store/useAppStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"

export default function SecuritySettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const { 
    appLockEnabled, 
    setAppLockEnabled, 
    biometricsEnabled, 
    setBiometricsEnabled,
    appPassword,
    setAppPassword,
    verifyPassword 
  } = useAppStore()

  // Password setup dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Password change dialog state
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')

  const handleAppLockToggle = (enabled: boolean) => {
    if (enabled) {
      // 启用应用锁
      if (!appPassword) {
        // 未设置密码，显示设置对话框
        setShowPasswordDialog(true)
      } else {
        // 已有密码，直接启用
        setAppLockEnabled(true)
      }
    } else {
      // 禁用应用锁
      setAppLockEnabled(false)
    }
  }

  const handleBiometricsToggle = (enabled: boolean) => {
    if (enabled && !appLockEnabled) {
      // 必须先启用应用锁
      alert(t('settings.security.enableAppLockFirst') || '请先启用应用锁')
      return
    }
    setBiometricsEnabled(enabled)
  }

  const handlePasswordSetup = () => {
    setPasswordError('')
    
    // 验证
    if (!newPassword) {
      setPasswordError(t('settings.security.passwordRequired') || '请输入密码')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError(t('settings.security.passwordTooShort') || '密码至少需要6位')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.security.passwordMismatch') || '两次密码不一致')
      return
    }

    // 设置密码并启用应用锁
    setAppPassword(newPassword)
    setAppLockEnabled(true)
    
    // 重置并关闭对话框
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordDialog(false)
  }

  const handlePasswordChange = () => {
    setChangePasswordError('')
    
    // 验证旧密码
    if (!verifyPassword(oldPassword)) {
      setChangePasswordError(t('settings.security.wrongPassword') || '旧密码错误')
      return
    }
    
    // 验证新密码
    if (!newPassword) {
      setChangePasswordError(t('settings.security.passwordRequired') || '请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      setChangePasswordError(t('settings.security.passwordTooShort') || '密码至少需要6位')
      return
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError(t('settings.security.passwordMismatch') || '两次密码不一致')
      return
    }

    // 修改密码
    setAppPassword(newPassword)
    
    // 重置并关闭对话框
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowChangePasswordDialog(false)
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-4 max-w-md mx-auto">
      <div className="flex items-center mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold ml-2">{t('settings.security', 'Security')}</h1>
      </div>

      <div className="space-y-6">
        {/* App Lock */}
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider ml-1">{t('settings.appLock', 'App Lock')}</h2>
            <Card className="bg-background-secondary border-divider">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium">{t('settings.appLock', 'App Lock')}</p>
                            <p className="text-xs text-text-secondary">{t('settings.appLockDesc')}</p>
                        </div>
                    </div>
                    <Switch checked={appLockEnabled} onCheckedChange={handleAppLockToggle} />
                </CardContent>
            </Card>
        </div>

        {/* Change Password (只在已设置密码时显示) */}
        {appPassword && (
          <div className="space-y-2">
            <Card className="bg-background-secondary border-divider">
              <CardContent className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setShowChangePasswordDialog(true)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{t('settings.changePassword') || '修改密码'}</p>
                    <p className="text-xs text-text-secondary">{t('settings.changePasswordDesc') || '修改应用锁密码'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Biometrics */}
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider ml-1">{t('settings.biometrics', 'Biometrics')}</h2>
            <Card className="bg-background-secondary border-divider">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium">{t('settings.biometrics', 'Biometrics')}</p>
                            <p className="text-xs text-text-secondary">{t('settings.biometricsDesc')}</p>
                        </div>
                    </div>
                    <Switch checked={biometricsEnabled} onCheckedChange={handleBiometricsToggle} />
                </CardContent>
            </Card>
        </div>
      </div>

      {/* 密码设置对话框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-background-secondary border-divider">
          <DialogHeader>
            <DialogTitle>{t('settings.setPassword') || '设置密码'}</DialogTitle>
            <DialogDescription>
              {t('settings.setPasswordDesc') || '请设置一个至少6位的密码来保护您的应用'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder={t('settings.newPassword') || '新密码'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background-primary border-divider"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder={t('settings.confirmPassword') || '确认密码'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background-primary border-divider"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPasswordDialog(false)}>
              {t('common.cancel') || '取消'}
            </Button>
            <Button onClick={handlePasswordSetup}>
              {t('common.confirm') || '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改密码对话框 */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="bg-background-secondary border-divider">
          <DialogHeader>
            <DialogTitle>{t('settings.changePassword') || '修改密码'}</DialogTitle>
            <DialogDescription>
              {t('settings.changePasswordDesc') || '请输入旧密码和新密码'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder={t('settings.oldPassword') || '旧密码'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-background-primary border-divider"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder={t('settings.newPassword') || '新密码'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background-primary border-divider"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder={t('settings.confirmPassword') || '确认新密码'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background-primary border-divider"
              />
            </div>
            {changePasswordError && (
              <p className="text-sm text-red-500">{changePasswordError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowChangePasswordDialog(false)}>
              {t('common.cancel') || '取消'}
            </Button>
            <Button onClick={handlePasswordChange}>
              {t('common.confirm') || '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
