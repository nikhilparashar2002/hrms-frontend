import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, XCircle, ClipboardList, Filter, X } from 'lucide-react'
import { employeeAPI, attendanceAPI } from '../services/api'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  if (!status) return <span className="text-xs text-zinc-400 italic">Not marked</span>
  const base = 'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full'
  return status === 'Present'
    ? <span className={`${base} bg-emerald-50 text-emerald-700`}><CheckCircle2 size={11} /> Present</span>
    : <span className={`${base} bg-red-50 text-red-600`}><XCircle size={11} /> Absent</span>
}

export default function Attendance() {
  usePageTitle('Attendance')
  const today = new Date().toISOString().split('T')[0]

  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [summaries, setSummaries] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [marking, setMarking] = useState({})

  const [selEmployee, setSelEmployee] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const [markForm, setMarkForm] = useState({ employee_id: '', date: today, status: 'Present' })
  const [markErrs, setMarkErrs] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [empRes, attRes] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll(),
      ])
      setEmployees(empRes.data)
      setRecords(attRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (!employees.length) return
    const go = async () => {
      const results = await Promise.allSettled(
        employees.map(e => attendanceAPI.getSummary(e.employee_id))
      )
      const map = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[employees[i].employee_id] = r.value.data
      })
      setSummaries(map)
    }
    go()
  }, [employees, records])

  function getTodayStatus(empId) {
    return records.find(r => r.employee_id === empId && r.date === today)?.status ?? null
  }

  function setField(key, val) {
    setMarkForm(f => ({ ...f, [key]: val }))
    if (markErrs[key]) setMarkErrs(e => ({ ...e, [key]: '' }))
  }

  async function handleMarkSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!markForm.employee_id) errs.employee_id = 'Please select an employee'
    if (!markForm.date) errs.date = 'Date is required'
    if (Object.keys(errs).length) { setMarkErrs(errs); return }
    setSubmitting(true)
    try {
      await attendanceAPI.mark(markForm)
      toast.success('Attendance saved')
      setShowForm(false)
      setMarkForm({ employee_id: '', date: today, status: 'Present' })
      loadAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQuickMark(empId, status) {
    setMarking(m => ({ ...m, [empId]: true }))
    try {
      await attendanceAPI.mark({ employee_id: empId, date: today, status })
      toast.success(`Marked ${status}`)
      loadAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setMarking(m => ({ ...m, [empId]: false }))
    }
  }

  const empMap = Object.fromEntries(employees.map(e => [e.employee_id, e]))

  const filteredRecords = records.filter(r => {
    if (selEmployee !== 'all' && r.employee_id !== selEmployee) return false
    if (filterDate && r.date !== filterDate) return false
    return true
  })

  if (loading) return <LoadingSpinner text="Loading attendance…" />
  if (error) return <ErrorMessage message={error} onRetry={loadAll} />

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="space-y-5">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Attendance</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{records.length} records total</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <ClipboardList size={15} /> Mark Attendance
          </button>
        )}
      </div>

      {/* mark attendance form */}
      {showForm && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-zinc-900">Mark attendance</h2>
            <button
              onClick={() => { setShowForm(false); setMarkErrs({}) }}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>
          {employees.length === 0 ? (
            <p className="text-sm text-zinc-500">Add employees first before marking attendance.</p>
          ) : (
            <form onSubmit={handleMarkSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Employee <span className="text-red-500">*</span></label>
                  <select
                    className={`input ${markErrs.employee_id ? 'input-error' : ''}`}
                    value={markForm.employee_id}
                    onChange={e => setField('employee_id', e.target.value)}
                  >
                    <option value="">Select employee…</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.full_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                  {markErrs.employee_id && <p className="field-error">{markErrs.employee_id}</p>}
                </div>
                <div>
                  <label className="label">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`input ${markErrs.date ? 'input-error' : ''}`}
                    value={markForm.date}
                    max={today}
                    onChange={e => setField('date', e.target.value)}
                  />
                  {markErrs.date && <p className="field-error">{markErrs.date}</p>}
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={markForm.status}
                    onChange={e => setField('status', e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <CalendarDays size={15} />
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowForm(false); setMarkErrs({}) }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* today's quick-mark table */}
      {employees.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-brand-600" />
            <span className="text-sm font-semibold text-zinc-900">Today — {todayLabel}</span>
          </div>

          {/* desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="table-header">Employee</th>
                  <th className="table-header">Dept.</th>
                  <th className="table-header">Present / Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Quick mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {employees.map(emp => {
                  const status = getTodayStatus(emp.employee_id)
                  const sum = summaries[emp.employee_id]
                  const busy = marking[emp.employee_id]
                  return (
                    <tr key={emp.employee_id} className="hover:bg-zinc-50 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-sm text-zinc-900">{emp.full_name}</p>
                        <code className="text-xs text-zinc-400">{emp.employee_id}</code>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          {emp.department}
                        </span>
                      </td>
                      <td className="table-cell text-sm">
                        {sum
                          ? <><span className="font-semibold text-emerald-600">{sum.present}</span><span className="text-zinc-400"> / {sum.total}</span></>
                          : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={status} />
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            disabled={busy}
                            onClick={() => handleQuickMark(emp.employee_id, 'Present')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors disabled:opacity-40"
                          >
                            <CheckCircle2 size={12} /> Present
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => handleQuickMark(emp.employee_id, 'Absent')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-40"
                          >
                            <XCircle size={12} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="sm:hidden divide-y divide-zinc-100">
            {employees.map(emp => {
              const status = getTodayStatus(emp.employee_id)
              const busy = marking[emp.employee_id]
              return (
                <div key={emp.employee_id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-zinc-900">{emp.full_name}</p>
                      <p className="text-xs text-zinc-400">{emp.department}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={busy}
                      onClick={() => handleQuickMark(emp.employee_id, 'Present')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-40"
                    >
                      <CheckCircle2 size={12} /> Present
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleQuickMark(emp.employee_id, 'Absent')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40"
                    >
                      <XCircle size={12} /> Absent
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* full records list with filters */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Filter size={14} className="text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-900">All Records</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="input sm:w-48 text-sm"
              value={selEmployee}
              onChange={e => setSelEmployee(e.target.value)}
            >
              <option value="all">All employees</option>
              {employees.map(e => (
                <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
              ))}
            </select>
            <input
              type="date"
              className="input sm:w-36 text-sm"
              value={filterDate}
              max={today}
              onChange={e => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 px-2"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No records found"
            description="Try adjusting the filters, or mark some attendance above."
          />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="table-header">Employee</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredRecords.map(rec => {
                    const emp = empMap[rec.employee_id]
                    return (
                      <tr key={rec.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="table-cell">
                          <p className="font-medium text-sm text-zinc-900">{emp?.full_name ?? rec.employee_id}</p>
                          <code className="text-xs text-zinc-400">{rec.employee_id}</code>
                        </td>
                        <td className="table-cell">
                          {emp && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                              {emp.department}
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-sm text-zinc-600">
                          {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={rec.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* mobile list */}
            <div className="sm:hidden divide-y divide-zinc-100">
              {filteredRecords.map(rec => {
                const emp = empMap[rec.employee_id]
                return (
                  <div key={rec.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-zinc-900 truncate">
                        {emp?.full_name ?? rec.employee_id}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        {emp && ` · ${emp.department}`}
                      </p>
                    </div>
                    <StatusBadge status={rec.status} />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
