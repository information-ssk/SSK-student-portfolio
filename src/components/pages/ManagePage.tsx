import React, { useState } from 'react'
import { Trash2, Edit3 } from 'lucide-react'
import { DetailModal } from '../common/DetailModal'
import { DeleteModal } from '../common/DeleteModal'
import { paginate } from '../../utils/helpers'
import type { Achievement } from '../../services/types'

interface ManagePageProps {
  achievements: Achievement[]
  onDelete: (id: string) => Promise<void>
  userEmail?: string
}

export const ManagePage: React.FC<ManagePageProps> = ({
  achievements,
  onDelete,
  userEmail = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const PAGE_SIZE = 10

  // Filter to only show user's achievements
  const userAchievements = achievements.filter(a => a.createdBy === userEmail)
  const paginated = paginate(userAchievements, currentPage, PAGE_SIZE)

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
      setSelectedAchievement(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="page-panel p-8 fade-in">
          <h1 className="font-heading font-bold text-2xl text-gray-900 mb-2">
            จัดการผลงาน
          </h1>
          <p className="text-gray-600 mb-6">
            แก้ไขและลบผลงานของคุณ ({userAchievements.length} รายการ)
          </p>

          {paginated.items.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-pink-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        ชื่อผลงาน
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        นักเรียน
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        วันที่
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        การแข่งขัน
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.items.map(achievement => (
                      <tr
                        key={achievement.id}
                        className="border-b border-pink-100 hover:bg-pink-50 transition"
                      >
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {achievement.activity}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {achievement.student}
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {achievement.date}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {achievement.competitions?.length || 0} รายการ
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedAchievement(achievement)}
                              className="p-2 hover:bg-pink-100 rounded-lg transition text-pink-600"
                              title="ดูรายละเอียด"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(achievement)}
                              className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginated.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: paginated.pages }, (_, i) => i + 1).map(
                    page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          currentPage === page
                            ? 'btn-pink text-white'
                            : 'btn-secondary text-pink-600'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">คุณยังไม่มีผลงานใด ๆ</p>
              <p className="text-sm text-gray-500 mt-2">เริ่มเพิ่มผลงานใหม่ได้เลย</p>
            </div>
          )}
        </div>
      </div>

      <DetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        onDelete={
          selectedAchievement ? () => setDeleteTarget(selectedAchievement) : undefined
        }
      />

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="ลบผลงาน"
        message={`คุณแน่ใจหรือว่าต้องการลบผลงาน "${deleteTarget?.activity}"?`}
      />
    </div>
  )
}
