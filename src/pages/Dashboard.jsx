import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, CheckCircle2, XCircle, Clock, ArrowRight, TrendingUp, CalendarDays } from 'lucide-react'
import { dashboardAPI, attendanceAPI } from '../services/api'
import { usePageTitle } from '../hooks/usePageTitle'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function Dashboard() {
  usePageTitle('Dashboard')

  const [stats, setStats] = useState(null)
  const [todayRecords, setTodayRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, attRes] = await Promise.all([
        dashboardAPI.getSummary(),
        attendanceAPI.getAll(today),
      ])
      setStats(dashRes.data)
      setTodayRecords(attRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingSpinner text="Loading dashboard…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  const { total_employees, present_today, absent_today, not_marked_today, departments } = stats

  const attendancePct = total_employees > 0
    ? Math.round((present_today / total_employees) * 100)
    : 0

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Overview</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Attendance rate today:</span>
          <span className={`font-semibold ${attendancePct >= 80 ? 'text-emerald-600' : attendancePct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
            {attendancePct}%
          </span>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Employees" value={total_employees} icon={Users} color="teal" />
        <StatCard label="Present Today" value={present_today} icon={CheckCircle2} color="green" sub={total_employees > 0 ? `of ${total_employees}` : undefined} />
        <StatCard label="Absent Today" value={absent_today} icon={XCircle} color="red" />
        <StatCard label="Not Marked" value={not_marked_today} icon={Clock} color="amber" sub="pending" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* department chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-zinc-800">By Department</h2>
          </div>
          {departments.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No employees added yet.</p>
          ) : (
            <div className="space-y-3.5">
              {departments.map(({ department, count }) => {
                const pct = total_employees > 0 ? (count / total_employees) * 100 : 0
                return (
                  <div key={department}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600 truncate max-w-[140px]">{department}</span>
                      <span className="text-zinc-400 ml-2 flex-shrink-0">{count} {count === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* today's attendance list */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-800">Today's Attendance</h2>
            <Link
              to="/attendance"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {todayRecords.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-zinc-400">No attendance recorded for today yet.</p>
              <Link to="/attendance" className="btn-primary mt-4 text-xs justify-center">
                Mark attendance now
              </Link>
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {todayRecords.slice(0, 10).map(rec => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
                      {rec.employee_id.replace(/\D/g, '').slice(-2) || '?'}
                    </div>
                    <span className="text-sm text-zinc-700 font-medium truncate">{rec.employee_id}</span>
                  </div>
                  <span className={rec.status === 'Present' ? 'badge-present' : 'badge-absent'}>
                    {rec.status === 'Present'
                      ? <><CheckCircle2 size={10} /> Present</>
                      : <><XCircle size={10} /> Absent</>
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* quick actions */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-zinc-500 mr-2">Quick actions:</span>
        <Link to="/employees" className="btn-primary text-xs px-3 py-1.5">
          <Users size={13} /> Add employee
        </Link>
        <Link to="/attendance" className="btn-secondary text-xs px-3 py-1.5">
          <CalendarDays size={13} /> Mark attendance
        </Link>
      </div>
    </div>
  )
}
