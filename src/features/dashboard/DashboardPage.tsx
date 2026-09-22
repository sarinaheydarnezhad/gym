import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowLeft, BarChart3, Check, ChevronLeft, MessageCircle, Sparkles } from 'lucide-react'
import { Avatar } from '../../components/common/Avatar'
import { Header } from '../../components/common/CoachHeader'
import type { Student, StudentAnalysis, Page } from '../../types'
import { analyzeStudent } from '../../analysis'
import { dayDiff, relativeDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'
import { normalizeIranianPhone } from '../../services/sharing/links'
import type { StudentActions } from '../../services/students/studentActions'

export function Dashboard({ students, openStudent, navigate, actions }: { students: Student[]; openStudent: (id: string) => void; navigate: (page: Page) => void; actions: StudentActions }) {
  const [statusFilter, setStatusFilter] = useState<StudentAnalysis['status'] | 'actionable'>('actionable')
  const [completedId, setCompletedId] = useState<string | null>(null)
  const ranked = useMemo(() => students.map(student => ({ student, analysis: analyzeStudent(student) })).sort((a, b) => b.analysis.score - a.analysis.score), [students])
  const attention = ranked.filter(item => item.analysis.status === 'attention')
  const watch = ranked.filter(item => item.analysis.status === 'watch')
  const stable = ranked.filter(item => item.analysis.status === 'stable')
  const priorities = statusFilter === 'actionable' ? ranked.filter(item => item.analysis.status !== 'stable') : ranked.filter(item => item.analysis.status === statusFilter)
  const toggleStatus = (status: StudentAnalysis['status']) => setStatusFilter(current => current === status ? 'actionable' : status)
  const markFollowUp = (student: Student) => {
    actions.recordFollowUp(student.id, 'dashboard')
    setCompletedId(student.id)
    window.setTimeout(() => setCompletedId(current => current === student.id ? null : current), 2600)
  }
  const messageStudent = (student: Student) => {
    const phone = normalizeIranianPhone(student.phone)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`سلام ${student.name.split(' ')[0]} عزیز، می‌خواستم وضعیت تمرین‌ها و حال این هفته‌ات را پیگیری کنم 🌱`)}`, '_blank', 'noopener,noreferrer')
  }
  return <>
    <Header title="امروز بهتره سراغ چه کسی بری؟" eyebrow="سلام مهدی، روزت پُرانرژی 👋" />
    <main className="page dashboard-page">
      <section className="hero-strip">
        <div className="hero-orb"><Sparkles /></div>
        <div><h2>{attention.length ? `خسته نباشی مهدی! امروز ${faNumber(attention.length)} تا از بچه‌ها منتظر پیگیری‌ان.` : 'خسته نباشی مهدی! امروز همه‌چیز رو‌به‌راهه.'}</h2><p>بر پایه‌ی آخرین گزارش هفتگی، روند تمرین و زمان آخرین ارتباط.</p></div>
        <div className="hero-stats" role="group" aria-label="فیلتر اولویت‌ها بر اساس وضعیت">{([
          ['attention', attention.length, 'فوری', 'danger'],
          ['watch', watch.length, 'پیگیری', 'warning'],
          ['stable', stable.length, 'پایدار', 'stable'],
        ] as const).map(([status, count, label, tone]) => <button key={status} type="button" className={statusFilter === status ? 'selected' : ''} aria-pressed={statusFilter === status} aria-label={`${label}، ${faNumber(count)} شاگرد`} onClick={() => toggleStatus(status)}><i className={`mini-donut ${tone}`} style={{ '--percent': `${count / Math.max(1, students.length) * 360}deg` } as CSSProperties}/><b>{faNumber(count)}</b><span>{label}</span></button>)}</div>
      </section>

      <div className="section-title"><div><h2>{statusFilter === 'stable' ? 'شاگردهای پایدار' : statusFilter === 'attention' ? 'پیگیری فوری' : statusFilter === 'watch' ? 'نیازمند بررسی' : 'اقدام‌های امروز'}</h2><p>{statusFilter === 'actionable' ? 'فقط شاگردهایی که امروز به بررسی یا پیگیری نیاز دارند' : 'فهرست بر اساس وضعیت انتخاب‌شده'}</p></div><button className="button secondary" onClick={() => navigate('students')}>همه شاگردها <ArrowLeft size={16} /></button></div>
      <section className="attention-grid" aria-label="فهرست اولویت‌های امروز">
        {priorities.map(({ student, analysis }) => {
          const primarySignal = analysis.signals.reduce<(typeof analysis.signals)[number] | undefined>((top, signal) => !top || signal.points > top.points ? signal : top, undefined)
          return <article className="attention-card priority-tile" key={student.id}>
            <button type="button" className="priority-main" onClick={() => openStudent(student.id)} aria-label={`${student.name}، ${student.goal}، ${primarySignal?.label ?? 'روند پایدار'}؛ مشاهده پروفایل`}>
              <Avatar student={student} size="sm" />
              <span className="priority-identity"><strong>{student.name}</strong><small>{student.goal}</small></span>
              <span className={`priority-reason ${primarySignal?.tone ?? 'stable'}`}>{primarySignal?.label ?? 'روند پایدار'}</span>
              <ChevronLeft className="priority-chevron" size={18} aria-hidden="true" />
            </button>
            <div className="priority-actions" aria-label={`اقدام‌های سریع برای ${student.name}`}>
              <button type="button" onClick={() => messageStudent(student)}><MessageCircle size={16}/> پیام</button>
              <button type="button" className={completedId === student.id ? 'done' : ''} onClick={() => markFollowUp(student)}><Check size={16}/>{completedId === student.id ? 'ثبت شد' : 'پیگیری شد'}</button>
            </div>
          </article>
        })}
        {!priorities.length && <div className="priority-empty" role="status">{statusFilter === 'actionable' ? 'امروز اقدام فوری یا پیگیری بازی ندارید.' : 'در این وضعیت شاگردی وجود ندارد.'}</div>}
        <p className="sr-only" aria-live="polite">{completedId ? 'پیگیری شاگرد ثبت شد.' : ''}</p>
      </section>

      <section className="lower-grid">
        <div className="panel">
          <div className="panel-heading"><div><h3>در انتظار گزارش هفتگی</h3><p>گزارش‌ها را خود شاگردان از پنل شخصی ارسال می‌کنند</p></div><span className="self-report-badge">ثبت توسط شاگرد</span></div>
          <div className="compact-list">{ranked.filter(x => !x.student.checkIns[0] || dayDiff(x.student.checkIns[0].date) > 7).slice(0, 4).map(({ student }) => <button key={student.id} onClick={() => openStudent(student.id)}><Avatar student={student} size="sm" /><span><strong>{student.name}</strong><small>آخرین گزارش: {relativeDate(student.checkIns[0]?.date || student.joinedAt)}</small></span><ChevronLeft size={18} /></button>)}</div>
        </div>
        <div className="panel weekly-panel">
          <div className="panel-heading"><div><h3>نبض این هفته</h3><p>خلاصه وضعیت همه شاگردها</p></div><BarChart3 size={21} /></div>
          <div className="pulse-row"><div className="pulse-value positive">+۱۲٪</div><div><strong>انجام تمرین</strong><span>نسبت به هفته قبل</span></div><div className="mini-bars"><i style={{ height: '35%' }} /><i style={{ height: '48%' }} /><i style={{ height: '42%' }} /><i style={{ height: '67%' }} /><i style={{ height: '76%' }} /><i style={{ height: '82%' }} /></div></div>
          <div className="metrics-row"><div><span>میانگین انرژی</span><b>۳٫۶ <small>/ ۵</small></b></div><div><span>نرخ پاسخ گزارش هفتگی</span><b>۷۸٪</b></div><div><span>جلسات انجام‌شده</span><b>۴۷</b></div></div>
        </div>
      </section>

    </main>
  </>
}
