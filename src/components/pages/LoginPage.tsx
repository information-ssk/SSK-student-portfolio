import React, { useState } from 'react'
import { LogIn } from 'lucide-react'

interface LoginPageProps {
  onLoginSuccess: (email: string, password: string, dept: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dept, setDept] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !dept) {
      setError('โปรดกรอกรหัสผ่านและแผนก')
      return
    }

    try {
      await onLoginSuccess(email, password, dept)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบล้มเหลว')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="page-panel p-8 w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-gray-900 mb-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-600">จัดการผลงานนักเรียนของคุณ</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              อีเมล (ถ้ามี)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="input-style"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รหัสผ่าน *
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              className="input-style"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              แผนก *
            </label>
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              className="input-style"
              required
            >
              <option value="">เลือกแผนก</option>
              <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
              <option value="ศิลป์">ศิลป์</option>
              <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-pink py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <button
          onClick={onCancel}
          className="w-full mt-4 py-2 border-2 border-pink-200 text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition"
        >
          ยกเลิก
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          ทดลอง: admin/sskssk, user/sskssk
        </p>
      </div>
    </div>
  )
}
