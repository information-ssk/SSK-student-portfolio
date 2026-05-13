import { useState, useCallback, useEffect } from 'react'
import { api } from '../services/api'
import type { Achievement } from '../services/types'

export const useAchievements = (token: string | null) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getAchievements(token || undefined)
      setAchievements(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load achievements'
      setError(message)
      console.error('Error loading achievements:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadAchievements()
  }, [loadAchievements])

  const addAchievement = useCallback(
    async (achievement: Achievement) => {
      if (!token) throw new Error('Not authenticated')
      try {
        await api.saveAchievement(achievement, token)
        await loadAchievements()
      } catch (err) {
        throw err
      }
    },
    [token, loadAchievements]
  )

  const updateAchievement = useCallback(
    async (achievement: Achievement) => {
      if (!token) throw new Error('Not authenticated')
      try {
        await api.updateAchievement(achievement, token)
        await loadAchievements()
      } catch (err) {
        throw err
      }
    },
    [token, loadAchievements]
  )

  const deleteAchievement = useCallback(
    async (id: string) => {
      if (!token) throw new Error('Not authenticated')
      try {
        await api.deleteAchievement(id, token)
        await loadAchievements()
      } catch (err) {
        throw err
      }
    },
    [token, loadAchievements]
  )

  return {
    achievements,
    loading,
    error,
    loadAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement,
  }
}
