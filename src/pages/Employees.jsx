import { useState } from 'react'
import { Plus, Search, Trash2, ChevronDown, UserPlus, Users } from 'lucide-react'
import { employeeAPI } from '../services/api'
import { useEmployees } from '../hooks/useEmployees'
import { usePageTitle } from '../hooks/usePageTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  'Engineering', 'HR', 'Finance', 'Marketing',
  'Sales', 'Operations', 'Legal', 'Design',
]

const empty = { employee_id: '', full_name: '', email: '', department: '' }

function validate(form) {
  const errs = {}
  if (!form.employee_id.trim()) errs.employee_id = 'Required'
  else if (!/^[A-Za-z0-9_-]+$/.test(form.employee_id.trim())) errs.employee_id = 'Only letters, numbers, hyphens and underscores'
  if (!form.full_name.trim()) errs.full_name = 'Required'
  else if (form.full_name.trim().length < 2) errs.full_name = 'Name too short'
  if (!form.email.trim()) errs.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
  if (!form.department) errs.department = 'Pick a department'
  return errs
}

export default function Employees() {
  usePageTitle('Employees')
  const { employees, loading, error, refetch } = useEmployees()

  const [form, setForm] = useState(empty)
  const [errs, setErrs] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    if (errs[key]) setErrs(e => ({ ...e, [key]: '' }))
  }

  function openForm() {
    setForm(empty)
    setErrs({})
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validation = validate(form)
    if (Object.keys(validation).length) { setErrs(validation); return }
    setSubmitting(true)
    try {
      await employeeAPI.create({ ...form, employee_id: form.employee_id.trim() })
      toast.success(`${form.full_name} added successfully`)
      setShowForm(false)
      setForm(empty)
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await employeeAPI.delete(toDelete.employee_id)
      toast.success('Employee removed')
      setToDelete(null)
      refetch()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    return (
      e.full_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Employees</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Loading…' : `${employees.length} total`}
          </p>
        </div>
        {!showForm && (
          <button onClick={openForm} className="btn-primary">
            <UserPlus size={15} /> Add employee
          </button>
        )}
      </div>

      {/* add form */}
      {showForm && (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-zinc-900">New employee</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="label">Employee ID <span className="text-red-500">*</span></label>
                <input
                  className={`input ${errs.employee_id ? 'input-error' : ''}`}
                  placeholder="e.g. EMP-001"
                  value={form.employee_id}
                  onChange={e => set('employee_id', e.target.value)}
                  autoFocus
                />
                {errs.employee_id && <p className="field-error">{errs.employee_id}</p>}
              </div>

              <div>
                <label className="label">Full Name <span className="text-red-500">*</span></label>
                <input
                  className={`input ${errs.full_name ? 'input-error' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                />
                {errs.full_name && <p className="field-error">{errs.full_name}</p>}
              </div>

              <div>
                <label className="label">Work Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className={`input ${errs.email ? 'input-error' : ''}`}
                  placeholder="priya@company.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
                {errs.email && <p className="field-error">{errs.email}</p>}
              </div>

              <div>
                <label className="label">Department <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className={`input appearance-none pr-8 ${errs.department ? 'input-error' : ''}`}
                    value={form.department}
                    onChange={e => set('department', e.target.value)}
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
                {errs.department && <p className="field-error">{errs.department}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button type="submit" className="btn-primary" disabled={submitting}>
                <Plus size={15} />
                {submitting ? 'Adding…' : 'Add Employee'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          className="input pl-9"
          placeholder="Search by name, ID, email or department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* list */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching employees…" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'No matches found' : 'No employees yet'}
            description={search ? 'Try a different search.' : 'Click "Add employee" to get started.'}
          />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="table-header">ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Department</th>
                    <th className="table-header w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map(emp => (
                    <tr key={emp.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="table-cell">
                        <code className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                          {emp.employee_id}
                        </code>
                      </td>
                      <td className="table-cell font-medium text-zinc-900">{emp.full_name}</td>
                      <td className="table-cell text-zinc-500">{emp.email}</td>
                      <td className="table-cell">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-medium">
                          {emp.department}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setToDelete(emp)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete employee"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile card list */}
            <div className="sm:hidden divide-y divide-zinc-100">
              {filtered.map(emp => (
                <div key={emp.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-zinc-900">{emp.full_name}</span>
                      <code className="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                        {emp.employee_id}
                      </code>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{emp.email}</p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 mt-1.5">
                      {emp.department}
                    </span>
                  </div>
                  <button
                    onClick={() => setToDelete(emp)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Remove employee?"
          message={`This will permanently delete ${toDelete.full_name} (${toDelete.employee_id}) and all their attendance records. There's no undo.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          confirmLabel="Yes, delete"
          loading={deleting}
        />
      )}
    </div>
  )
}
