import { useState } from 'react'
import { ChevronLeft, Plus, Search } from 'lucide-react'
import { Avatar } from '../../components/common/Avatar'
import { StatusPill } from '../../components/common/StatusPill'
import { EmptyState } from '../../components/common/EmptyState'
import { Header } from '../../components/common/CoachHeader'
import type { Student } from '../../types'
import { analyzeStudent } from '../../analysis'
import { relativeDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'

export function StudentsPage({ students, openStudent, addStudent }: { students: Student[]; openStudent: (id: string) => void; addStudent: () => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'attention' | 'watch' | 'stable'>('all')
  const rows = students.map(student => ({ student, analysis: analyzeStudent(student) })).filter(({ student, analysis }) => (filter === 'all' || analysis.status === filter) && student.name.includes(query))
  return <><Header title="شاگردها" eyebrow={`${faNumber(students.length)} شاگرد فعال`} /><main className="page">
    <div className="toolbar"><div className="search-box"><Search size={19} /><input aria-label="جست‌وجوی شاگرد" value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی نام شاگرد..." /></div><button className="button primary" onClick={addStudent}><Plus size={18} /> شاگرد جدید</button></div>
    <div className="filter-tabs">{([['all', 'همه'], ['attention', 'پیگیری امروز'], ['watch', 'زیر نظر'], ['stable', 'روبه‌راه']] as const).map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <section className="students-table panel">
      <div className="table-head"><span>شاگرد</span><span>هدف</span><span>آخرین گزارش</span><span>انجام جلسات</span><span>وضعیت</span><span /></div>
      {rows.map(({ student, analysis }) => <button className="student-row" key={student.id} onClick={() => openStudent(student.id)}><span className="student-cell"><Avatar student={student} size="sm" /><span><strong>{student.name}</strong><small>{student.plan}</small></span></span><span>{student.goal}</span><span>{student.checkIns[0] ? relativeDate(student.checkIns[0].date) : '—'}</span><span><i className="progress"><i style={{ width: `${student.sessionsAttended / student.sessionsPlanned * 100}%` }} /></i>{faNumber(student.sessionsAttended)} از {faNumber(student.sessionsPlanned)}</span><span><StatusPill analysis={analysis} /></span><span><ChevronLeft /></span></button>)}
      {!rows.length && <EmptyState icon={<Search />} title="نتیجه‌ای پیدا نشد" text="عبارت جست‌وجو یا فیلتر را تغییر دهید." />}
    </section>
  </main></>
}
