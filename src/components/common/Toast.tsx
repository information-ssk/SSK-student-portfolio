import React from 'react'
import type { ToastMessage } from '../../services/types'

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 pointer-events-none z-[9999]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          className={`fade-in px-6 py-3 rounded-xl text-white font-medium shadow-lg cursor-pointer pointer-events-auto ${
            toast.type === 'error'
              ? 'bg-red-500'
              : toast.type === 'info'
                ? 'bg-blue-500'
                : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
