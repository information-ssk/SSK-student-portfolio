import React, { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { DetailModal } from '../common/DetailModal'
import { paginate, truncate } from '../../utils/helpers'
import type { Achievement } from '../../services/types'

interface HomePageProps {
  achievements: Achievement[]
  onRecordClick?: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ achievements, onRecordClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const PAGE_SIZE = 9

  // Filter achievements
  const filtered = achievements.filter(a => {
    const matchesSearch =
      searchTerm === '' ||
      a.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel =
      filterLevel === '' ||
      (a.competitions && a.competitions.some(c => c.level === filterLevel))

    return matchesSearch && matchesLevel
  })

  const paginated = paginate(filtered, currentPage, PAGE_SIZE)

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="page-panel p-8 mb-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-pink-500 font-semibold mb-2">
                ผลงานความภาคภูมิใจนักเรียน
              </p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-gray-900 leading-tight">
                จัดการผลงานนักเรียนและครูได้ง่ายในที่เดียว
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl">
                ระบบเรียบหรู ใช้ง่าย พร้อมหน้าจอค้นหา และโมดูลจัดการผลงานที่สวยงามเหมือนหน้า Canva
              </p>
            </div>
            {onRecordClick && (
              <div className="rounded-[32px] bg-pink-50 p-6 shadow-sm border border-pink-100 text-center">
                <p className="text-sm text-pink-500 mb-2">เพิ่มผลงานใหม่</p>
                <button
                  onClick={onRecordClick}
                  className="btn-pink px-6 py-3 rounded-3xl font-semibold flex items-center gap-2 justify-center"
                >
                  <Plus className="w-5 h-5" />
                  เพิ่มผลงาน
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
            <input
              type="text"
              placeholder="ค้นหาผลงาน..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="input-style pl-10"
            />
          </div>
          <select
            value={filterLevel}
            onChange={e => {
              setFilterLevel(e.target.value)
              setCurrentPage(1)
            }}
            className="input-style sm:w-48"
          >
            <option value="">ทุกระดับ</option>
            <option value="school">โรงเรียน</option>
            <option value="district">อำเภอ</option>
            <option value="province">จังหวัด</option>
            <option value="national">ประเทศ</option>
            <option value="international">นานาชาติ</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600 mb-4">
          แสดง {paginated.items.length} จาก {paginated.total} ผลงาน
        </div>

        {/* Grid */}
        {paginated.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginated.items.map(achievement => (
                <div
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="card-hover page-panel p-6 cursor-pointer"
                >
                  <div className="mb-3">
                    <span className="inline-block bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {achievement.dept}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {achievement.activity}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {achievement.student}
                  </p>

                  {achievement.competitions && achievement.competitions.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {achievement.competitions.slice(0, 2).map((comp, idx) => (
                        <p key={idx} className="text-xs text-pink-600 font-medium">
                          🏆 {comp.name}
                        </p>
                      ))}
                      {achievement.competitions.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{achievement.competitions.length - 2} อื่นๆ
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-400">{achievement.date}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {paginated.pages > 1 && (
              <div className="flex justify-center gap-2 mb-8">
                {Array.from({ length: paginated.pages }, (_, i) => i + 1).map(page => (
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
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">ไม่พบผลงานในรายการค้นหา</p>
          </div>
        )}
      </main>

      <DetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}
