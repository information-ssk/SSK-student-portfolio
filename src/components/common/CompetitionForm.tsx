import React from 'react'
import { Plus, X } from 'lucide-react'
import type { Competition } from '../../services/types'

interface CompetitionFormProps {
  competitions: Competition[]
  onAdd: (competition: Competition) => void
  onRemove: (index: number) => void
}

export const CompetitionForm: React.FC<CompetitionFormProps> = ({
  competitions,
  onAdd,
  onRemove,
}) => {
  const [newComp, setNewComp] = React.useState<Partial<Competition>>({
    level: 'school',
    result: 'participation',
  })

  const handleAddCompetition = () => {
    if (newComp.name) {
      onAdd({
        name: newComp.name,
        level: (newComp.level as Competition['level']) || 'school',
        date: newComp.date || new Date().toISOString().split('T')[0],
        result: (newComp.result as Competition['result']) || 'participation',
        medal: newComp.medal,
        award: newComp.award,
        coach: newComp.coach,
        isTeam: newComp.isTeam,
        teamMembers: newComp.teamMembers || [],
      })
      setNewComp({ level: 'school', result: 'participation' })
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-gray-700 mb-2 block">
          การแข่งขัน
        </span>

        {competitions.length > 0 && (
          <div className="space-y-2 mb-4">
            {competitions.map((comp, idx) => (
              <div key={idx} className="bg-pink-50 p-3 rounded-lg flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{comp.name}</p>
                  <p className="text-xs text-gray-600">
                    ระดับ: {comp.level} | ผล: {comp.result}
                  </p>
                  {comp.coach && (
                    <p className="text-xs text-gray-600">โค้ช: {comp.coach}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="p-1 hover:bg-pink-200 rounded transition"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border-2 border-dashed border-pink-200">
          <div>
            <input
              type="text"
              placeholder="ชื่อการแข่งขัน"
              value={newComp.name || ''}
              onChange={e => setNewComp({ ...newComp, name: e.target.value })}
              className="input-style"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newComp.level || 'school'}
              onChange={e =>
                setNewComp({
                  ...newComp,
                  level: e.target.value as Competition['level'],
                })
              }
              className="input-style"
            >
              <option value="school">โรงเรียน</option>
              <option value="district">อำเภอ</option>
              <option value="province">จังหวัด</option>
              <option value="national">ประเทศ</option>
              <option value="international">นานาชาติ</option>
            </select>

            <select
              value={newComp.result || 'participation'}
              onChange={e =>
                setNewComp({
                  ...newComp,
                  result: e.target.value as Competition['result'],
                })
              }
              className="input-style"
            >
              <option value="participation">เข้าร่วม</option>
              <option value="bronze">ทองแดง</option>
              <option value="silver">เงิน</option>
              <option value="gold">ทอง</option>
            </select>
          </div>

          <input
            type="date"
            value={newComp.date || ''}
            onChange={e => setNewComp({ ...newComp, date: e.target.value })}
            className="input-style"
          />

          <input
            type="text"
            placeholder="รางวัล (ถ้ามี)"
            value={newComp.award || ''}
            onChange={e => setNewComp({ ...newComp, award: e.target.value })}
            className="input-style"
          />

          <input
            type="text"
            placeholder="ชื่อโค้ช (ถ้ามี)"
            value={newComp.coach || ''}
            onChange={e => setNewComp({ ...newComp, coach: e.target.value })}
            className="input-style"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newComp.isTeam || false}
              onChange={e => setNewComp({ ...newComp, isTeam: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">เป็นการแข่งขันทีม</span>
          </label>

          <button
            type="button"
            onClick={handleAddCompetition}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่มการแข่งขัน
          </button>
        </div>
      </label>
    </div>
  )
}
