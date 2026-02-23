import { useState, useEffect, useCallback } from 'react'
import { attendanceAPI } from '../services/api'

export function useAttendance(filterDate = '') {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await attendanceAPI.getAll(filterDate || undefined)
      setRecords(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterDate])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { records, loading, error, refetch: fetch }
}
