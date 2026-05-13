import React, { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Achievement } from '../../services/types'

interface DetailModalProps {
  achievement: Achievement | null
  onClose: () => void
  onDelete?: () => void
  isLoading?: boolean
}

export const DetailModal: React.FC<DetailModalProps> = ({
  achievement,
  onClose,
  onDelete,
  isLoading = false,
}) => {
  if (!achievement) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card bg-white w-full mx-4 fade-in">
        <div className="flex items-center justify-between p-6 border-b border-pink-100">
          <h2 className="font-heading font-bold text-xl text-gray-900">
            {achievement.activity}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-pink-50 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-pink-500 font-semibold">นักเรียน</p>
              <p className="text-gray-900">{achievement.student}</p>
            </div>
            <div>
              <p className="text-sm text-pink-500 font-semibold">แผนก</p>
              <p className="text-gray-900">{achievement.dept}</p>
            </div>
            <div>
              <p className="text-sm text-pink-500 font-semibold">วันที่</p>
              <p className="text-gray-900">{achievement.date}</p>
            </div>
            <div>
              <p className="text-sm text-pink-500 font-semibold">กิจกรรม</p>
              <p className="text-gray-900">{achievement.activity}</p>
            </div>
          </div>

          {achievement.competitions && achievement.competitions.length > 0 && (
            <div>
              <p className="text-sm text-pink-500 font-semibold mb-2">การแข่งขัน</p>
              <div className="space-y-2">
                {achievement.competitions.map((comp, idx) => (
                  <div key={idx} className="bg-pink-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{comp.name}</p>
                    <p className="text-sm text-gray-600">ระดับ: {comp.level}</p>
                    <p className="text-sm text-gray-600">ผล: {comp.result}</p>
                    {comp.coach && (
                      <p className="text-sm text-gray-600">โค้ช: {comp.coach}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {achievement.fileUrl && (
            <div>
              <a
                href={achievement.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 font-medium text-sm"
              >
                📎 ดูไฟล์แนบ
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-pink-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-pink-200 text-pink-600 font-medium hover:bg-pink-50 transition"
          >
            ปิด
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              ลบ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
