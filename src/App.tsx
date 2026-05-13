import React, { useEffect } from 'react'
import { Header } from './components/common/Header'
import { Toast } from './components/common/Toast'
import { HomePage } from './components/pages/HomePage'
import { LoginPage } from './components/pages/LoginPage'
import { RecordPage } from './components/pages/RecordPage'
import { ManagePage } from './components/pages/ManagePage'
import { useAuth } from './hooks/useAuth'
import { useAchievements } from './hooks/useAchievements'
import { useToast } from './hooks/useToast'
import type { Achievement } from './services/types'

type PageType = 'home' | 'login' | 'record' | 'manage'

function App() {
  const [currentPage, setCurrentPage] = React.useState<PageType>('home')
  const authState = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const achievements = useAchievements(authState.token)

  // Initialize auth on mount
  useEffect(() => {
    authState.initializeAuth()
  }, [])

  const handleShowPage = (page: PageType) => {
    if (page === 'login' && !authState.isAuthenticated) {
      setCurrentPage('login')
    } else if (page === 'record' && authState.isAuthenticated) {
      setCurrentPage('record')
    } else if (page === 'manage' && authState.isAuthenticated) {
      setCurrentPage('manage')
    } else if (page === 'home') {
      setCurrentPage('home')
    }
  }

  const handleLogin = async (email: string, password: string, dept: string) => {
    try {
      await authState.login(email, password, dept)
      addToast('เข้าสู่ระบบสำเร็จ', 'success')
      setCurrentPage('home')
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'เข้าสู่ระบบล้มเหลว',
        'error'
      )
      throw error
    }
  }

  const handleLogout = () => {
    authState.logout()
    addToast('ออกจากระบบสำเร็จ', 'success')
    setCurrentPage('home')
  }

  const handleSaveAchievement = async (achievement: Achievement) => {
    try {
      if (achievement.id) {
        await achievements.updateAchievement(achievement)
        addToast('อัปเดตผลงานสำเร็จ', 'success')
      } else {
        await achievements.addAchievement(achievement)
        addToast('บันทึกผลงานสำเร็จ', 'success')
      }
      setCurrentPage('home')
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้',
        'error'
      )
      throw error
    }
  }

  const handleDeleteAchievement = async (id: string) => {
    try {
      await achievements.deleteAchievement(id)
      addToast('ลบผลงานสำเร็จ', 'success')
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'ไม่สามารถลบได้',
        'error'
      )
      throw error
    }
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <Header
        isAuthenticated={authState.isAuthenticated}
        userBadge={authState.isAdmin ? 'Admin' : authState.dept || authState.email}
        isAdmin={authState.isAdmin}
        onLogin={() => handleShowPage('login')}
        onLogout={handleLogout}
        onTogglePage={handleShowPage}
      />

      <main className="w-full overflow-auto">
        {currentPage === 'home' && (
          <HomePage
            achievements={achievements.achievements}
            onRecordClick={
              authState.isAuthenticated
                ? () => handleShowPage('record')
                : () => handleShowPage('login')
            }
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLogin}
            onCancel={() => handleShowPage('home')}
            isLoading={false}
          />
        )}

        {currentPage === 'record' && authState.isAuthenticated && (
          <RecordPage
            onSave={handleSaveAchievement}
            onCancel={() => handleShowPage('home')}
            userEmail={authState.email || ''}
            userDept={authState.dept || ''}
            isLoading={false}
          />
        )}

        {currentPage === 'manage' && authState.isAuthenticated && (
          <ManagePage
            achievements={achievements.achievements}
            onDelete={handleDeleteAchievement}
            userEmail={authState.email || ''}
          />
        )}
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Navigation buttons for demo (hidden on large screens) */}
      {authState.isAuthenticated && currentPage !== 'manage' && (
        <div className="fixed bottom-4 left-4 md:hidden">
          <button
            onClick={() => handleShowPage('manage')}
            className="btn-pink px-4 py-2 rounded-lg text-sm font-medium"
          >
            จัดการ
          </button>
        </div>
      )}
    </div>
  )
}

export default App
