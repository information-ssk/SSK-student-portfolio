import React, { useState } from 'react'
import { FileUp, Plus } from 'lucide-react'
import { CompetitionForm } from '../common/CompetitionForm'
import type { Achievement, Competition } from '../../services/types'

interface RecordPageProps {
  onSave: (achievement: Achievement) => Promise<void>
  onCancel: () => void
  userEmail?: string
  userDept?: string
  isLoading?: boolean
}

export const RecordPage: React.FC<RecordPageProps> = ({
  onSave,
  onCancel,
  userEmail = '',
  userDept = '',
  isLoading = false,
}) => {
  const [student, setStudent] = useState('')
  const [dept, setDept] = useState(userDept)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [activity, setActivity] = useState('')
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleAddCompetition = (competition: Competition) => {
    setCompetitions([...competitions, competition])
  }

  const handleRemoveCompetition = (index: number) => {
    setCompetitions(competitions.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      // In a real implementation, you would call api.uploadFile here
      // For now, we'll simulate it
      setFileName(file.name)
      setFileUrl(URL.createObjectURL(file))
    } catch (err) {
      setError('ไม่สามารถอัพโหลดไฟล์ได้')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!student || !dept || !activity) {
      setError('โปรดกรอกข้อมูลที่จำเป็น')
      return
    }

    try {
      const achievement: Achievement = {
        date,
        student,
        dept,
        activity,
        competitions,
        fileUrl,
        fileName,
        createdBy: userEmail,
      }
      await onSave(achievement)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกได้')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="page-panel p-8 fade-in">
          <h1 className="font-heading font-bold text-2xl text-gray-900 mb-2">
            เพิ่มผลงานใหม่
          </h1>
          <p className="text-gray-600 mb-8">
            บันทึกผลงานและความสำเร็จของนักเรียน
          </p>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Date and Student */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  วันที่ *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input-style"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อนักเรียน *
                </label>
                <input
                  type="text"
                  value={student}
                  onChange={e => setStudent(e.target.value)}
                  placeholder="กรอกชื่อนักเรียน"
                  className="input-style"
                  required
                />
              </div>
            </div>

            {/* Row 2: Department */}
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

            {/* Row 3: Activity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                กิจกรรม/ผลงาน *
              </label>
              <input
                type="text"
                value={activity}
                onChange={e => setActivity(e.target.value)}
                placeholder="ชื่อกิจกรรมหรือผลงาน"
                className="input-style"
                required
              />
            </div>

            {/* Row 4: Competitions */}
            <CompetitionForm
              competitions={competitions}
              onAdd={handleAddCompetition}
              onRemove={handleRemoveCompetition}
            />

            {/* Row 5: File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ไฟล์แนบ
              </label>
              <div className="border-2 border-dashed border-pink-200 rounded-lg p-6">
                {fileName ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-green-600">✓ {fileName}</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <span className="text-sm text-pink-600 hover:text-pink-700 cursor-pointer font-medium">
                        {uploading ? 'กำลังอัพโหลด...' : 'เปลี่ยนไฟล์'}
                      </span>
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <FileUp className="w-8 h-8 text-pink-300" />
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? 'กำลังอัพโหลด...' : 'คลิกเพื่ออัพโหลดไฟล์'}
                      </span>
                      <span className="text-xs text-gray-500">หรือลากไฟล์มาปล่อยที่นี่</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-pink-100">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-pink py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 border-2 border-pink-200 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
