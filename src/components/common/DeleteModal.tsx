import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  message?: string
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = 'ยืนยันการลบ',
  message = 'คุณแน่ใจหรือว่าต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถเลิกทำได้',
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card bg-white w-full mx-4 fade-in">
        <div className="flex items-center gap-3 p-6 border-b border-red-100 bg-red-50">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="font-heading font-bold text-lg text-red-600">{title}</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex gap-3 p-6 border-t border-red-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-50"
          >
            {isLoading ? 'กำลังลบ...' : 'ลบ'}
          </button>
        </div>
      </div>
    </div>
  )
}
