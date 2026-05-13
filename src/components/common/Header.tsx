import React from 'react'
import { LogOut, Menu } from 'lucide-react'

interface HeaderProps {
  isAuthenticated: boolean
  userBadge?: string
  isAdmin?: boolean
  onLogin?: () => void
  onLogout?: () => void
  onTogglePage?: (page: string) => void
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  userBadge,
  isAdmin,
  onLogin,
  onLogout,
  onTogglePage,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <header className="glass sticky top-0 z-50 border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://www.ssk.ac.th/wp-content/uploads/2015/07/ssklogo158x190px.png"
            alt="โลโก้โรงเรียนสตรีสิริเกศ"
            className="w-10 h-12 object-contain"
            loading="lazy"
            onError={e => {
              (e.target as HTMLImageElement).style.background = '#fce7f3'
            }}
          />
          <div>
            <h1 className="font-heading font-bold text-pink-700 text-lg leading-tight">
              ผลงานความภาคภูมิใจนักเรียน
            </h1>
            <p className="text-pink-400 text-xs">โรงเรียนสตรีสิริเกศ</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-gray-700 bg-pink-50 px-3 py-1 rounded-full">
                {isAdmin ? '👨‍💼 Admin' : userBadge}
              </span>
              <button
                onClick={onLogout}
                className="btn-pink px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="btn-pink px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-pink-50 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-pink-600" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-pink-100 p-4 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="text-sm font-medium text-gray-700 bg-pink-50 px-3 py-2 rounded-lg">
                {isAdmin ? '👨‍💼 Admin' : userBadge}
              </div>
              <button
                onClick={onLogout}
                className="w-full btn-pink px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="w-full btn-pink px-4 py-2 rounded-lg text-sm font-medium"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      )}
    </header>
  )
}
