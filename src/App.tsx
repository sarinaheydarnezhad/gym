import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import {
  Activity, AlertCircle, ArrowLeft, BarChart3, Bell, Bot, CalendarDays, Check,
  ChevronLeft, CircleUserRound, ClipboardCheck, Clock3, Dumbbell, FileText,
  LayoutDashboard, Menu, MessageCircle, Plus, Search, Send, Settings, Sparkles,
  Target, TrendingDown, UserPlus, Users, Weight, X, ListChecks, Play, Trophy, RotateCcw,
  Share2, Copy, LogOut, ShieldCheck, LockKeyhole, UserCog, Building2,
  BookOpen, CreditCard, Moon, Sun, UserRound, WalletCards,
} from 'lucide-react'
import { analyzeStudent, answerStudentQuestion, calculateAdherence, dayDiff, getExerciseTrend } from './analysis'
import { seedStudents } from './data'
import type { CheckIn, ExercisePrescription, Student, StudentAnalysis, TimelineItem, WorkoutDay, WorkoutLog } from './types'

type Page = 'dashboard' | 'students' | 'library' | 'checkins' | 'settings' | 'profile'
type ClientPage = 'home' | 'plan' | 'workout' | 'progress' | 'checkin'
type UserRole = 'coach' | 'admin'
const STORAGE_KEY = 'hamrah-coach-students-v1'
const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']

const faNumber = (value: number) => value.toLocaleString('fa-IR')
const faDate = (date: string) => new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(new Date(date))
const fullDate = () => new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
const relativeDate = (date: string) => {
  const days = dayDiff(date)
  return days === 0 ? 'امروز' : days === 1 ? 'دیروز' : `${faNumber(days)} روز پیش`
}

function Avatar({ student, size = 'md' }: { student: Student; size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`avatar avatar-${size}`} style={{ background: student.color }}>{student.initials}</div>
}

function StatusPill({ analysis }: { analysis: StudentAnalysis }) {
  const labels = { attention: 'بهتره امروز پیگیری بشه', watch: 'زیر نظر', stable: 'روبه‌راه' }
  return <span className={`status-pill ${analysis.status}`}><i />{labels[analysis.status]}</span>
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
}

function Sidebar({ page, onNavigate, open, close, logout }: { page: Page; onNavigate: (page: Page) => void; open: boolean; close: () => void; logout: () => void }) {
  const nav = [
    { id: 'dashboard' as Page, label: 'امروز', icon: <LayoutDashboard size={19} /> },
    { id: 'students' as Page, label: 'شاگردها', icon: <Users size={19} /> },
    { id: 'checkins' as Page, label: 'گزارش‌های هفتگی', icon: <ClipboardCheck size={19} /> },
  ]
  return <>
    {open && <button className="sidebar-backdrop" onClick={close} aria-label="بستن منو" />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <button className="mobile-close" onClick={close}><X /></button>
      <div className="brand"><div className="brand-mark"><Activity /></div><div><strong>شاگردیتو</strong><small>فضای حرفه‌ای مربی‌ها</small></div></div>
      <nav>
        <p className="nav-label">فضای کار</p>
        {nav.map(item => <button key={item.id} className={page === item.id || (page === 'profile' && item.id === 'students') ? 'active' : ''} onClick={() => { onNavigate(item.id); close() }}>{item.icon}<span>{item.label}</span>{item.id === 'dashboard' && <b>۳</b>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <button className={page === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}><Settings size={19} /><span>تنظیمات</span></button>
        <div className="coach-card"><div className="coach-avatar">م‌ح</div><div><strong>مهدی حسینی</strong><small>مربی شخصی</small></div><button className="logout-mini" onClick={logout} title="خروج"><LogOut size={17}/></button></div>
      </div>
    </aside>
  </>
}

function Header({ title, eyebrow, onMenu }: { title: string; eyebrow?: string; onMenu: () => void }) {
  return <header className="topbar">
    <div className="header-copy"><button className="menu-button" onClick={onMenu}><Menu /></button><div>{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1></div></div>
    <div className="header-actions"><button className="icon-button" title="اعلان‌ها"><Bell size={20} /><i /></button><span className="today-date">{fullDate()}</span><div className="coach-photo" aria-label="مهدی حسینی"><UserRound size={20}/></div></div>
  </header>
}

function Dashboard({ students, openStudent, addStudent, navigate }: { students: Student[]; openStudent: (id: string) => void; addStudent: () => void; navigate: (page: Page) => void }) {
  const ranked = useMemo(() => students.map(student => ({ student, analysis: analyzeStudent(student) })).sort((a, b) => b.analysis.score - a.analysis.score), [students])
  const attention = ranked.filter(item => item.analysis.status === 'attention')
  const watch = ranked.filter(item => item.analysis.status === 'watch')
  const stable = ranked.filter(item => item.analysis.status === 'stable')
  return <>
    <Header title="امروز بهتره سراغ چه کسی بری؟" eyebrow="سلام مهدی، روزت پُرانرژی 👋" onMenu={() => document.body.classList.add('menu-request')} />
    <main className="page dashboard-page">
      <section className="hero-strip">
        <div className="hero-orb"><Sparkles /></div>
        <div><h2>{attention.length ? `خسته نباشی مهدی! امروز ${faNumber(attention.length)} تا از بچه‌ها منتظر پیگیری‌ان.` : 'خسته نباشی مهدی! امروز همه‌چیز رو‌به‌راهه.'}</h2><p>بر پایه‌ی آخرین گزارش هفتگی، روند تمرین و زمان آخرین ارتباط.</p></div>
        <div className="hero-stats"><span><i className="mini-donut danger" style={{ '--percent': `${attention.length / Math.max(1, students.length) * 360}deg` } as CSSProperties}/><b>{faNumber(attention.length)}</b>فوری</span><span><i className="mini-donut warning" style={{ '--percent': `${watch.length / Math.max(1, students.length) * 360}deg` } as CSSProperties}/><b>{faNumber(watch.length)}</b>پیگیری</span><span><i className="mini-donut stable" style={{ '--percent': `${stable.length / Math.max(1, students.length) * 360}deg` } as CSSProperties}/><b>{faNumber(stable.length)}</b>پایدار</span></div>
      </section>

      <div className="section-title"><div><h2>اولویت‌های امروز</h2><p>مهم‌ترین تغییرها، مرتب‌شده بر اساس میزان نیاز به توجه</p></div><button className="button secondary" onClick={() => navigate('students')}>همه شاگردها <ArrowLeft size={16} /></button></div>
      <section className="attention-grid">
        {attention.slice(0, 3).map(({ student, analysis }, index) => <article className="attention-card" key={student.id}>
          <div className="priority-number">{faNumber(index + 1)}</div>
          <div className="card-head"><Avatar student={student} /><div><h3>{student.name}</h3><span>{student.goal}</span></div><StatusPill analysis={analysis} /></div>
          <div className="signal-list">
            {analysis.signals.slice(0, 3).map(signal => <div className={`signal ${signal.tone}`} key={signal.id}><div className="signal-icon">{signal.id === 'pain' ? <AlertCircle /> : signal.id === 'contact' ? <MessageCircle /> : signal.id === 'attendance' ? <CalendarDays /> : <TrendingDown />}</div><div><strong>{signal.label}</strong><span>{signal.detail}</span></div></div>)}
          </div>
          <div className="next-action"><Sparkles size={16} /><div><small>اقدام پیشنهادی</small><p>{analysis.action}</p></div></div>
          <div className="card-actions"><button className="button primary" onClick={() => openStudent(student.id)}>بررسی شاگرد <ArrowLeft size={16} /></button><button className="icon-button" title="پیام"><MessageCircle size={18} /></button></div>
        </article>)}
      </section>

      <section className="lower-grid">
        <div className="panel">
          <div className="panel-heading"><div><h3>در انتظار گزارش هفتگی</h3><p>شاگردانی که گزارش این هفته را نفرستاده‌اند</p></div><button className="text-button" onClick={() => navigate('checkins')}>مشاهده همه</button></div>
          <div className="compact-list">{ranked.filter(x => !x.student.checkIns[0] || dayDiff(x.student.checkIns[0].date) > 7).slice(0, 4).map(({ student }) => <button key={student.id} onClick={() => openStudent(student.id)}><Avatar student={student} size="sm" /><span><strong>{student.name}</strong><small>آخرین گزارش: {relativeDate(student.checkIns[0]?.date || student.joinedAt)}</small></span><ChevronLeft size={18} /></button>)}</div>
        </div>
        <div className="panel weekly-panel">
          <div className="panel-heading"><div><h3>نبض این هفته</h3><p>خلاصه وضعیت همه شاگردها</p></div><BarChart3 size={21} /></div>
          <div className="pulse-row"><div className="pulse-value positive">+۱۲٪</div><div><strong>انجام تمرین</strong><span>نسبت به هفته قبل</span></div><div className="mini-bars"><i style={{ height: '35%' }} /><i style={{ height: '48%' }} /><i style={{ height: '42%' }} /><i style={{ height: '67%' }} /><i style={{ height: '76%' }} /><i style={{ height: '82%' }} /></div></div>
          <div className="metrics-row"><div><span>میانگین انرژی</span><b>۳٫۶ <small>/ ۵</small></b></div><div><span>نرخ پاسخ گزارش هفتگی</span><b>۷۸٪</b></div><div><span>جلسات انجام‌شده</span><b>۴۷</b></div></div>
        </div>
      </section>

      <button className="floating-add" onClick={addStudent}><UserPlus size={19} /> افزودن شاگرد</button>
    </main>
  </>
}

function StudentsPage({ students, openStudent, addStudent }: { students: Student[]; openStudent: (id: string) => void; addStudent: () => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'attention' | 'watch' | 'stable'>('all')
  const rows = students.map(student => ({ student, analysis: analyzeStudent(student) })).filter(({ student, analysis }) => (filter === 'all' || analysis.status === filter) && student.name.includes(query))
  return <><Header title="شاگردها" eyebrow={`${faNumber(students.length)} شاگرد فعال`} onMenu={() => document.body.classList.add('menu-request')} /><main className="page">
    <div className="toolbar"><div className="search-box"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی نام شاگرد..." /></div><button className="button primary" onClick={addStudent}><Plus size={18} /> شاگرد جدید</button></div>
    <div className="filter-tabs">{([['all', 'همه'], ['attention', 'پیگیری امروز'], ['watch', 'زیر نظر'], ['stable', 'روبه‌راه']] as const).map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <section className="students-table panel">
      <div className="table-head"><span>شاگرد</span><span>هدف</span><span>آخرین گزارش</span><span>انجام جلسات</span><span>وضعیت</span><span /></div>
      {rows.map(({ student, analysis }) => <button className="student-row" key={student.id} onClick={() => openStudent(student.id)}><span className="student-cell"><Avatar student={student} size="sm" /><span><strong>{student.name}</strong><small>{student.plan}</small></span></span><span>{student.goal}</span><span>{student.checkIns[0] ? relativeDate(student.checkIns[0].date) : '—'}</span><span><i className="progress"><i style={{ width: `${student.sessionsAttended / student.sessionsPlanned * 100}%` }} /></i>{faNumber(student.sessionsAttended)} از {faNumber(student.sessionsPlanned)}</span><span><StatusPill analysis={analysis} /></span><span><ChevronLeft /></span></button>)}
      {!rows.length && <EmptyState icon={<Search />} title="نتیجه‌ای پیدا نشد" text="عبارت جست‌وجو یا فیلتر را تغییر دهید." />}
    </section>
  </main></>
}

function TrendChart({ student }: { student: Student }) {
  const points = [...student.checkIns].reverse()
  if (!points.length) return null
  const min = Math.min(...points.map(p => p.weight)) - 1
  const max = Math.max(...points.map(p => p.weight)) + 1
  const coords = points.map((p, i) => `${10 + i * (80 / Math.max(1, points.length - 1))},${90 - ((p.weight - min) / Math.max(1, max - min)) * 70}`).join(' ')
  return <div className="chart-wrap"><div className="chart-title"><span>روند وزن</span><b>{points.at(-1)?.weight.toLocaleString('fa-IR')} <small>کیلوگرم</small></b></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f705c" stopOpacity=".25"/><stop offset="1" stopColor="#4f705c" stopOpacity="0"/></linearGradient></defs><polygon points={`10,90 ${coords} 90,90`} fill="url(#fill)"/><polyline points={coords} fill="none" stroke="#4f705c" strokeWidth="2" vectorEffect="non-scaling-stroke"/>{points.map((p, i) => <circle key={p.id} cx={10 + i * (80 / Math.max(1, points.length - 1))} cy={90 - ((p.weight - min) / Math.max(1, max - min)) * 70} r="2.7" fill="#fff" stroke="#4f705c" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>)}</svg><div className="chart-labels"><span>{faDate(points[0].date)}</span><span>{faDate(points.at(-1)!.date)}</span></div></div>
}

function ProgramPanel({ student, updateStudent }: { student: Student; updateStudent: (student: Student) => void }) {
  const [customExercise, setCustomExercise] = useState('')
  const [showShare, setShowShare] = useState(false)
  const library = ['Hip Thrust', 'Goblet Squat', 'Romanian Deadlift', 'Lat Pulldown', 'Dumbbell Press', 'Leg Press']
  const touchProgram = (program: Student['program']) => updateStudent({ ...student, program: { ...program, updatedAt: new Date().toISOString() } })
  const updateExercise = (dayId: string, exerciseId: string, field: keyof ExercisePrescription, value: string | number) => {
    touchProgram({ ...student.program, days: student.program.days.map(day => day.id !== dayId ? day : { ...day, exercises: day.exercises.map(exercise => exercise.id !== exerciseId ? exercise : { ...exercise, [field]: value }) }) })
  }
  const addExercise = (dayId: string, name: string) => {
    const exercise: ExercisePrescription = { id: crypto.randomUUID(), name, sets: 3, reps: '۱۰', targetWeight: 0 }
    touchProgram({ ...student.program, days: student.program.days.map(day => day.id === dayId ? { ...day, exercises: [...day.exercises, exercise] } : day) })
  }
  const addCustomExercise = (dayId: string) => { const name = customExercise.trim(); if (!name) return; addExercise(dayId, name); setCustomExercise('') }
  const removeExercise = (dayId: string, exerciseId: string) => touchProgram({ ...student.program, days: student.program.days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.filter(exercise => exercise.id !== exerciseId) } : day) })
  const renameDay = (dayId: string, title: string) => touchProgram({ ...student.program, days: student.program.days.map(day => day.id === dayId ? { ...day, title } : day) })
  const removeDay = (dayId: string) => touchProgram({ ...student.program, days: student.program.days.filter(day => day.id !== dayId) })
  const addDay = () => {
    const day: WorkoutDay = { id: crypto.randomUUID(), dayIndex: (student.program.days.at(-1)?.dayIndex ?? 0) + 1 > 6 ? 0 : (student.program.days.at(-1)?.dayIndex ?? 0) + 1, title: 'جلسه جدید', exercises: [] }
    touchProgram({ ...student.program, days: [...student.program.days, day] })
  }
  const share = async (months: number, price: string) => {
    const url = `${window.location.origin}${window.location.pathname}?program=${student.id}&plan=${months}`
    touchProgram({ ...student.program, sentAt: new Date().toISOString(), coachName: 'مهدی حسینی' })
    try { if (navigator.share) await navigator.share({ title: `برنامه ${student.name}`, text: `اشتراک ${months} ماهه برنامه تمرینی`, url }); else await navigator.clipboard.writeText(url) } catch { /* dismissed */ }
    setShowShare(false)
  }
  return <section className="program-panel">
    <div className="program-toolbar"><div><small>برنامه فعال</small><input className="program-title-input" value={student.program.title} onChange={e => touchProgram({ ...student.program, title: e.target.value })}/><p>{faNumber(student.program.days.length)} جلسه در هفته · آخرین ویرایش {relativeDate(student.program.updatedAt)}</p></div><div className="program-toolbar-actions"><button className="button share-program" onClick={() => setShowShare(true)}><Share2 size={17}/> اشتراک برنامه</button><button className="button secondary" onClick={addDay}><Plus size={17}/> افزودن جلسه</button></div></div>
    <div className="program-days">{student.program.days.map((day, dayIndex) => <article className="program-day panel" key={day.id}><div className="program-day-head"><div className="day-number">{faNumber(dayIndex + 1)}</div><div><input className="day-title-input" value={day.title} onChange={e => renameDay(day.id, e.target.value)} /><span>{dayNames[day.dayIndex]}</span></div><span>{faNumber(day.exercises.length)} حرکت</span><button className="delete-day" onClick={() => removeDay(day.id)} title="حذف جلسه"><X size={15}/></button></div>
      <div className="exercise-editor-head"><span>حرکت</span><span>ست</span><span>تکرار</span><span>وزنه هدف</span></div>
      {day.exercises.map(exercise => <div className="exercise-editor-row" key={exercise.id}><div><strong>{exercise.name}</strong>{exercise.note && <small>{exercise.note}</small>}</div><div className="stepper"><button type="button" onClick={() => updateExercise(day.id, exercise.id, 'sets', Math.max(1, exercise.sets - 1))}>−</button><input type="number" inputMode="numeric" value={exercise.sets} min="1" onChange={e => updateExercise(day.id, exercise.id, 'sets', Math.max(1, Number(e.target.value)))}/><button type="button" onClick={() => updateExercise(day.id, exercise.id, 'sets', exercise.sets + 1)}>+</button></div><input className="number-input" type="number" inputMode="numeric" value={exercise.reps} onChange={e => updateExercise(day.id, exercise.id, 'reps', e.target.value)}/><label><input type="number" inputMode="decimal" value={exercise.targetWeight || ''} min="0" onChange={e => updateExercise(day.id, exercise.id, 'targetWeight', Number(e.target.value))}/><small>kg</small></label><button className="delete-exercise" onClick={() => removeExercise(day.id, exercise.id)} title="حذف حرکت"><X size={14}/></button></div>)}
      <div className="library-add"><span>افزودن سریع:</span>{library.filter(name => !day.exercises.some(ex => ex.name === name)).slice(0, 3).map(name => <button key={name} onClick={() => addExercise(day.id, name)}><Plus size={12}/>{name}</button>)}<div className="custom-exercise"><input value={customExercise} onChange={e => setCustomExercise(e.target.value)} placeholder="نام حرکت دلخواه مربی..." onKeyDown={e => e.key === 'Enter' && addCustomExercise(day.id)}/><button onClick={() => addCustomExercise(day.id)}><Plus size={14}/> افزودن حرکت</button></div></div>
    </article>)}</div>
    {!student.program.days.length && <EmptyState icon={<Dumbbell/>} title="اولین جلسه را بسازید" text="جلسه جدید اضافه کنید و حرکت‌ها را خودتان بنویسید." />}
    {showShare && <div className="modal-layer"><div className="share-modal"><button className="modal-close" onClick={() => setShowShare(false)}><X/></button><div className="share-modal-icon"><Share2/></div><h2>اشتراک برنامه برای {student.name}</h2><p>مدت دسترسی را انتخاب کنید؛ لینک اختصاصی ساخته می‌شود.</p><div className="share-plans"><button onClick={() => share(1, '۴۹۰٬۰۰۰ تومان')}><strong>یک ماهه</strong><b>۴۹۰٬۰۰۰ تومان</b><small>شروع سریع و منعطف</small></button><button className="featured" onClick={() => share(3, '۱٬۲۹۰٬۰۰۰ تومان')}><i>پیشنهاد مربی‌ها</i><strong>سه ماهه</strong><b>۱٬۲۹۰٬۰۰۰ تومان</b><small>صرفه‌جویی بیشتر</small></button><button onClick={() => share(6, '۲٬۲۹۰٬۰۰۰ تومان')}><strong>شش ماهه</strong><b>۲٬۲۹۰٬۰۰۰ تومان</b><small>همراهی بلندمدت</small></button></div><div className="share-meta"><span><UserCog size={15}/> مربی: مهدی حسینی</span><span><CalendarDays size={15}/> تاریخ ارسال: {new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span></div></div></div>}
  </section>
}

function ProgressPanel({ student }: { student: Student }) {
  const adherence = calculateAdherence(student)
  const trend = getExerciseTrend(student)
  return <div className="progress-layout"><section className="panel progress-summary"><div className="adherence-ring" style={{ '--value': `${adherence.percent * 3.6}deg` } as CSSProperties}><div><strong>{faNumber(adherence.percent)}٪</strong><span>پایبندی</span></div></div><div><small>۱۴ روز اخیر</small><h2>{faNumber(adherence.completed)} از {faNumber(adherence.planned)} تمرین</h2><p>{adherence.percent >= 75 ? 'روند انجام برنامه خوب است.' : 'انجام برنامه کمتر از هدف تعیین‌شده است.'}</p></div></section><section className="panel performance-card"><div className="panel-heading"><div><h3>روند عملکرد</h3><p>Hip Thrust · ثبت‌های اخیر</p></div><Trophy size={20}/></div><div className="performance-values">{trend.values.slice(-5).map((value, index) => <div key={value.date}><span>هفته {faNumber(index + 1)}</span><b>{value.weight.toLocaleString('fa-IR')} kg × {faNumber(value.reps)}</b></div>)}</div><div className={`trend-result ${trend.state}`}><TrendingDown size={17}/><span>{trend.state === 'improving' ? `${trend.change.toLocaleString('fa-IR')} کیلوگرم پیشرفت ثبت شده` : trend.state === 'plateau' ? 'سه ثبت متوالی بدون تغییر' : trend.state === 'decline' ? 'کاهش عملکرد نیازمند بررسی است' : 'داده بیشتری برای تشخیص روند لازم است'}</span></div></section><section className="panel measurement-card"><div className="panel-heading"><div><h3>اندازه‌گیری‌ها</h3><p>آخرین تغییرات بدن</p></div><Weight size={19}/></div>{student.measurements.map(item => <div className="measurement-row" key={item.id}><time>{faDate(item.date)}</time><span><small>وزن</small><b>{item.weight.toLocaleString('fa-IR')} kg</b></span><span><small>دور کمر</small><b>{item.waist?.toLocaleString('fa-IR') || '—'} cm</b></span><span><small>دور باسن</small><b>{item.hip?.toLocaleString('fa-IR') || '—'} cm</b></span></div>)}</section></div>
}

function CheckInHistory({ student }: { student: Student }) {
  return <section className="checkin-history panel"><div className="panel-heading"><div><h3>تاریخچه گزارش‌های هفتگی</h3><p>تغییرات حال عمومی شاگرد در طول زمان</p></div><ClipboardCheck size={20}/></div>{student.checkIns.map(item => <div className="checkin-history-row" key={item.id}><time>{faDate(item.date)}</time><span><small>انرژی</small><b>{faNumber(item.energy)}/۵</b></span><span><small>خواب</small><b>{faNumber(item.sleep)}/۵</b></span><span><small>کیفیت تمرین</small><b>{faNumber(item.workoutCompletion)}٪</b></span><span className="checkin-note">{item.pain || item.note || 'بدون توضیح'}</span></div>)}</section>
}

function HealthRings({ checkIn }: { checkIn?: CheckIn }) {
  const sleep = (checkIn?.sleep ?? 0) / 5 * 360
  const energy = (checkIn?.energy ?? 0) / 5 * 360
  const nutrition = (checkIn?.nutrition ?? 0) / 5 * 360
  return <section className="panel health-card"><div className="health-rings" style={{ '--sleep': `${sleep}deg`, '--energy': `${energy}deg`, '--nutrition': `${nutrition}deg` } as CSSProperties}><i className="ring ring-sleep"/><i className="ring ring-energy"/><i className="ring ring-nutrition"/><Activity/></div><div className="health-copy"><small>وضعیت امروز</small><h3>حلقه‌های سلامت</h3><p>خواب، انرژی و تغذیه بر اساس آخرین گزارش شاگرد</p><div className="health-legend"><span><i className="turquoise"/>خواب {faNumber(checkIn?.sleep ?? 0)}/۵</span><span><i className="mustard"/>انرژی {faNumber(checkIn?.energy ?? 0)}/۵</span><span><i className="emerald"/>تغذیه {faNumber(checkIn?.nutrition ?? 0)}/۵</span></div></div></section>
}

function ProfilePage({ student, updateStudent, goBack }: { student: Student; updateStudent: (student: Student) => void; goBack: () => void }) {
  const analysis = analyzeStudent(student)
  const latest = student.checkIns[0]
  const [tab, setTab] = useState<'overview' | 'program' | 'progress' | 'checkins' | 'timeline' | 'finance' | 'assistant'>('overview')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([])
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [shared, setShared] = useState(false)

  const shareProgram = async () => {
    const url = `${window.location.origin}${window.location.pathname}?program=${student.id}`
    try {
      if (navigator.share) await navigator.share({ title: `برنامه تمرینی ${student.name}`, text: `برنامه‌ات در شاگردیتو آماده است`, url })
      else await navigator.clipboard.writeText(url)
      setShared(true)
      window.setTimeout(() => setShared(false), 2600)
    } catch { /* کاربر پنجره اشتراک‌گذاری را بسته است */ }
  }

  const ask = (value?: string) => {
    const q = value || question
    if (!q.trim()) return
    setMessages(prev => [...prev, { q, a: answerStudentQuestion(student, q) }]); setQuestion(''); setTab('assistant')
  }
  const saveNote = () => {
    if (!note.trim()) return
    const item: TimelineItem = { id: crypto.randomUUID(), date: new Date().toISOString(), type: 'note', title: 'یادداشت مربی', body: note }
    updateStudent({ ...student, timeline: [item, ...student.timeline] }); setNote(''); setShowNote(false)
  }
  const markContact = () => {
    const now = new Date().toISOString()
    updateStudent({ ...student, lastContact: now, timeline: [{ id: crypto.randomUUID(), date: now, type: 'message', title: 'پیگیری انجام شد', body: 'تماس با شاگرد توسط مربی ثبت شد.' }, ...student.timeline] })
  }
  return <><header className="profile-header"><button className="back-button" onClick={goBack}><ArrowLeft size={18} /> بازگشت</button><div className="profile-actions"><button className={`button share-program ${shared ? 'done' : ''}`} onClick={shareProgram}>{shared ? <Check size={17}/> : <Share2 size={17}/>} {shared ? 'لینک آماده شد' : 'اشتراک برنامه'}</button><button className="button secondary" onClick={() => setShowNote(true)}><FileText size={17} /> یادداشت جدید</button><button className="button primary" onClick={markContact}><Check size={17} /> ثبت پیگیری</button></div></header><main className="page profile-page">
    <section className="profile-identity"><Avatar student={student} size="lg" /><div><div className="name-line"><h1>{student.name}</h1><StatusPill analysis={analysis} /></div><p>{student.goal} · {student.plan}</p><div className="identity-meta"><span><CircleUserRound /> عضو از {faDate(student.joinedAt)}</span><span><MessageCircle /> آخرین ارتباط {relativeDate(student.lastContact)}</span></div></div><div className={`attention-score ${analysis.status}`}><strong>{faNumber(analysis.score)}</strong><span>ریسک ریزش</span></div></section>
    <div className="quick-messengers"><button onClick={() => window.open(`https://wa.me/${student.phone.replace(/\D/g, '').replace(/^0/, '98')}?text=${encodeURIComponent('سلام! گزارش هفتگی یادت نره 🌱')}`, '_blank')}><MessageCircle size={16}/> واتساپ</button><button onClick={() => navigator.clipboard.writeText('سلام! گزارش هفتگی یادت نره 🌱')}><Copy size={16}/> کپی یادآور</button></div><div className="profile-tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>نمای کلی</button><button className={tab === 'program' ? 'active' : ''} onClick={() => setTab('program')}>برنامه تمرینی</button><button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>پیشرفت</button><button className={tab === 'checkins' ? 'active' : ''} onClick={() => setTab('checkins')}>گزارش‌های هفتگی</button><button className={tab === 'finance' ? 'active' : ''} onClick={() => setTab('finance')}><CreditCard size={15}/> امور مالی</button><button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>یادداشت‌ها</button><button className={tab === 'assistant' ? 'active' : ''} onClick={() => setTab('assistant')}><Sparkles size={15} /> دستیار مربی</button></div><button className="assistant-fab" onClick={() => setTab('assistant')} aria-label="باز کردن دستیار مربی"><Bot size={20} /></button>

    {tab === 'overview' && <div className="profile-grid"><div className="profile-main">
      <section className={`insight-panel ${analysis.status}`}><div className="insight-heading"><div className="insight-icon"><Sparkles /></div><div><small>جمع‌بندی شاگردیتو</small><h2>{analysis.summary}</h2></div></div><div className="insight-signals">{analysis.signals.length ? analysis.signals.map(signal => <div key={signal.id}><i className={signal.tone}>{signal.tone === 'danger' ? <AlertCircle /> : <Activity />}</i><span><strong>{signal.label}</strong><small>{signal.detail}</small></span></div>) : <p>در اطلاعات اخیر نشانه نگران‌کننده‌ای دیده نشد.</p>}</div><div className="suggested-action"><Target size={19} /><div><small>بهترین اقدام بعدی</small><p>{analysis.action}</p></div><button onClick={markContact}>انجام شد</button></div></section>
      <HealthRings checkIn={latest}/><section className="panel"><div className="panel-heading"><div><h3>آخرین وضعیت</h3><p>{latest ? `ثبت‌شده در ${faDate(latest.date)}` : 'هنوز گزارش هفتگی ثبت نشده'}</p></div></div>{latest && <div className="metric-cards"><div><Activity /><span>انرژی</span><b>{faNumber(latest.energy)} <small>/ ۵</small></b></div><div><Clock3 /><span>خواب</span><b>{faNumber(latest.sleep)} <small>/ ۵</small></b></div><div><Dumbbell /><span>انجام تمرین</span><b>{faNumber(latest.workoutCompletion)}٪</b></div><div><Weight /><span>وزن</span><b>{latest.weight.toLocaleString('fa-IR')} <small>ک‌گ</small></b></div></div>}</section>
      <section className="panel"><TrendChart student={student} /></section>
    </div><aside className="profile-side"><section className="panel quick-ask"><div className="bot-badge"><Bot /></div><h3>از دستیار مربی بپرس</h3><p>درباره روند، یادداشت‌ها یا وضعیت این شاگرد سؤال کن.</p><div className="ask-field"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="مثلاً: آخرین بار کی درد داشت؟" /><button onClick={() => ask()}><Send /></button></div><div className="suggestions"><button onClick={() => ask('چرا بهتره امروز پیگیری شود؟')}>چرا امروز پیگیری شود؟</button><button onClick={() => ask('روند وزنش چطور بوده؟')}>روند وزن چطور بوده؟</button><button onClick={() => ask('آیا سابقه درد دارد؟')}>سابقه درد دارد؟</button></div></section><section className="panel contact-card"><h3>اطلاعات شاگرد</h3><dl><div><dt>شماره تماس</dt><dd>{student.phone}</dd></div><div><dt>هدف</dt><dd>{student.goal}</dd></div><div><dt>نوع همکاری</dt><dd>{student.plan}</dd></div></dl></section></aside></div>}

    {tab === 'timeline' && <section className="timeline-layout"><div className="timeline panel">{student.timeline.map(item => <div className={`timeline-item ${item.important ? 'important' : ''}`} key={item.id}><div className="timeline-dot">{item.type === 'checkin' ? <ClipboardCheck /> : item.type === 'message' ? <MessageCircle /> : item.type === 'workout' ? <Dumbbell /> : <FileText />}</div><div><time>{faDate(item.date)} · {relativeDate(item.date)}</time><h3>{item.title}</h3><p>{item.body}</p></div></div>)}</div></section>}
    {tab === 'program' && <ProgramPanel student={student} updateStudent={updateStudent} />}
    {tab === 'progress' && <ProgressPanel student={student} />}
    {tab === 'checkins' && <CheckInHistory student={student} />}
    {tab === 'finance' && <section className="finance-grid"><article className={`panel billing-status ${student.sessionsAttended >= student.sessionsPlanned ? 'expired' : ''}`}><div className="billing-icon"><WalletCards/></div><div><small>وضعیت اشتراک</small><h2>{student.sessionsAttended >= student.sessionsPlanned ? 'نیازمند تمدید' : 'اشتراک فعال'}</h2><p>{faNumber(Math.max(0, student.sessionsPlanned - student.sessionsAttended))} جلسه از پکیج باقی مانده است.</p></div><button className="button primary" onClick={() => navigator.clipboard.writeText(`سلام ${student.name} عزیز، موعد تمدید اشتراکت رسیده. برای ادامه برنامه پیام بده 🌱`)}><Copy size={16}/> کپی پیام تمدید</button></article><article className="panel payment-card"><div className="panel-heading"><div><h3>ثبت پرداخت جدید</h3><p>مناسب پرداخت کارت‌به‌کارت و ثبت دستی مربی</p></div><CreditCard/></div><div className="payment-fields"><label>مبلغ<input type="number" inputMode="numeric" placeholder="مثلاً ۱٬۵۰۰٬۰۰۰"/></label><label>تاریخ پرداخت<input type="date" defaultValue="2026-09-18"/></label><label>نوع پکیج<select><option>۳۰ روزه</option><option>۱۰ جلسه‌ای</option><option>سه ماهه</option></select></label><button className="button primary">ثبت پرداخت</button></div></article></section>}
    {tab === 'assistant' && <section className="assistant-view panel"><div className="assistant-intro"><div className="bot-badge"><Sparkles /></div><div><h2>درباره {student.name} بپرسید</h2><p>پاسخ‌ها بر اساس گزارش‌های هفتگی، اندازه‌گیری‌ها و یادداشت‌های ثبت‌شده‌اند.</p></div></div><div className="chat-area">{messages.length === 0 && <div className="chat-prompts"><button onClick={() => ask('چرا بهتره امروز پیگیری شود؟')}>چرا امروز پیگیری شود؟</button><button onClick={() => ask('آخرین وضعیت خواب و انرژی چطور بوده؟')}>وضعیت خواب و انرژی؟</button><button onClick={() => ask('آخرین بار کی با او تماس داشتم؟')}>آخرین ارتباط چه زمانی بود؟</button></div>}{messages.map((message, index) => <div className="chat-pair" key={index}><p className="coach-message">{message.q}</p><div className="bot-message"><Sparkles size={17} /><p>{message.a}</p></div></div>)}</div><div className="chat-input"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="سؤال خود را بنویسید..." /><button onClick={() => ask()}><Send /></button></div><small className="ai-note">این جمع‌بندی ممکن است خطا داشته باشد؛ تصمیم نهایی با مربی است.</small></section>}
  </main>{showNote && <div className="modal-layer"><div className="modal small"><button className="modal-close" onClick={() => setShowNote(false)}><X /></button><h2>یادداشت جدید</h2><p>این یادداشت در حافظه و خط زمانی شاگرد باقی می‌ماند.</p><textarea autoFocus value={note} onChange={e => setNote(e.target.value)} placeholder="مثلاً: امروز هنگام اسکوات از درد زانوی راست گفت..." rows={5} /><button className="button primary full" onClick={saveNote}>ذخیره یادداشت</button></div></div>}</>
}

function CheckInsPage({ students, updateStudent }: { students: Student[]; updateStudent: (student: Student) => void }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id || '')
  const student = students.find(s => s.id === selectedId)!
  const [saved, setSaved] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget)
    const checkIn: CheckIn = { id: crypto.randomUUID(), date: new Date().toISOString(), energy: Number(data.get('energy')), sleep: Number(data.get('sleep')), nutrition: Number(data.get('nutrition')), workoutCompletion: Number(data.get('completion')), weight: Number(data.get('weight')), mood: Number(data.get('mood')), pain: String(data.get('pain') || ''), note: String(data.get('note') || '') }
    updateStudent({ ...student, checkIns: [checkIn, ...student.checkIns], timeline: [{ id: crypto.randomUUID(), date: checkIn.date, type: 'checkin', title: 'گزارش هفتگی ثبت شد', body: `انرژی ${checkIn.energy} از ۵ · انجام تمرین ${checkIn.workoutCompletion}٪`, important: Boolean(checkIn.pain) }, ...student.timeline] }); setSaved(true)
  }
  return <><Header title="گزارش‌های هفتگی" eyebrow="ثبت و مرور حال شاگردها" onMenu={() => document.body.classList.add('menu-request')} /><main className="page"><div className="checkin-layout"><section className="panel checkin-info"><div className="form-brand"><Activity /> شاگردیتو</div><h2>حال این هفته چطور بوده؟</h2><p>این فرم کوتاه کمک می‌کند تصمیم‌های تمرینی دقیق‌تری بگیرید.</p><label>انتخاب شاگرد</label><select value={selectedId} onChange={e => { setSelectedId(e.target.value); setSaved(false) }}>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="privacy-note"><Check /><span><strong>اطلاعات امن و خصوصی</strong><small>پاسخ‌ها فقط در فضای کاری مربی دیده می‌شوند.</small></span></div></section>
    <form className="panel checkin-form" onSubmit={submit}>{saved ? <div className="success-state"><div><Check /></div><h2>گزارش با موفقیت ثبت شد</h2><p>پاسخ‌ها به پروفایل {student.name} اضافه و وضعیت او به‌روز شد.</p><button type="button" className="button secondary" onClick={() => setSaved(false)}>ثبت گزارش دیگر</button></div> : <><h3>حال عمومی</h3><RangeField name="energy" label="سطح انرژی" low="خیلی کم" high="عالی" /><RangeField name="sleep" label="کیفیت خواب" low="ضعیف" high="عالی" /><RangeField name="mood" label="حال و روحیه" low="بد" high="عالی" /><RangeField name="nutrition" label="رعایت تغذیه" low="کم" high="کامل" /><hr/><h3>تمرین و بدن</h3><label className="field-label">چند درصد تمرین‌ها انجام شده؟<input name="completion" type="number" min="0" max="100" defaultValue="80" required/><span>درصد</span></label><label className="field-label">وزن فعلی<input name="weight" type="number" step="0.1" min="30" max="250" defaultValue={student.checkIns[0]?.weight || 70} required/><span>کیلوگرم</span></label><label className="textarea-label">این هفته درد یا ناراحتی جدیدی وجود داشته؟<textarea name="pain" rows={2} placeholder="اگر موردی نیست، خالی بگذارید." /></label><label className="textarea-label">توضیح دیگری برای مربی<textarea name="note" rows={3} placeholder="هر نکته‌ای که برای تنظیم برنامه مهم است..." /></label><button className="button primary full" type="submit">ثبت گزارش هفتگی <ArrowLeft size={18}/></button></>}</form></div></main></>
}

function RangeField({ name, label, low, high }: { name: string; label: string; low: string; high: string }) {
  const [value, setValue] = useState(3)
  const energyIcons = ['🪫', '😮‍💨', '🙂', '⚡', '🔥']
  const sleepIcons = ['🌑', '🌘', '🌗', '🌖', '🌕']
  const icons = name === 'sleep' ? sleepIcons : energyIcons
  return <div className={`range-field choice-field value-${value}`}><span><b>{label}</b><strong>{faNumber(value)} از ۵</strong></span><input name={name} type="hidden" value={value}/><div className="scale-options" role="radiogroup" aria-label={label}>{icons.map((icon, index) => <button type="button" role="radio" aria-checked={value === index + 1} className={value === index + 1 ? 'selected' : ''} key={icon} onClick={() => setValue(index + 1)}><i>{icon}</i><small>{faNumber(index + 1)}</small></button>)}</div><small className="range-caption"><i>{low}</i><i>{high}</i></small></div>
}

function ClientWorkout({ student, day, updateStudent, done }: { student: Student; day: WorkoutDay; updateStudent: (student: Student) => void; done: () => void }) {
  const [results, setResults] = useState(() => day.exercises.map(exercise => ({ exerciseId: exercise.id, exerciseName: exercise.name, completed: false, actualWeight: exercise.targetWeight || 0, actualReps: Number.parseInt(exercise.reps) || 0 })))
  const completedCount = results.filter(result => result.completed).length
  const updateResult = (id: string, field: 'completed' | 'actualWeight' | 'actualReps', value: boolean | number) => setResults(current => current.map(result => result.exerciseId === id ? { ...result, [field]: value } : result))
  const finishWorkout = () => {
    const now = new Date().toISOString()
    const log: WorkoutLog = { id: crypto.randomUUID(), workoutDayId: day.id, workoutTitle: day.title, date: now, completed: completedCount === day.exercises.length, results }
    const timeline: TimelineItem = { id: crypto.randomUUID(), date: now, type: 'workout', title: `${day.title} ثبت شد`, body: `${completedCount} مورد از ${day.exercises.length} حرکت انجام شد.` }
    updateStudent({ ...student, workoutLogs: [log, ...student.workoutLogs], sessionsAttended: student.sessionsAttended + 1, timeline: [timeline, ...student.timeline] }); done()
  }
  return <div className="client-workout"><div className="client-workout-title"><small>تمرین امروز</small><h1>{day.title}</h1><p>{faNumber(day.exercises.length)} حرکت · حدود ۵۰ دقیقه</p></div><div className="workout-progress"><i style={{ width: `${completedCount / Math.max(1, day.exercises.length) * 100}%` }}/><span>{faNumber(completedCount)} از {faNumber(day.exercises.length)} حرکت</span></div><div className="workout-exercises">{day.exercises.map((exercise, index) => { const result = results.find(item => item.exerciseId === exercise.id)!; return <article className={result.completed ? 'completed' : ''} key={exercise.id}><button className="exercise-check" onClick={() => updateResult(exercise.id, 'completed', !result.completed)}>{result.completed ? <Check/> : faNumber(index + 1)}</button><div className="exercise-main"><h3>{exercise.name}</h3><p>{faNumber(exercise.sets)} ست × {exercise.reps} تکرار {exercise.targetWeight ? `· هدف ${exercise.targetWeight.toLocaleString('fa-IR')} کیلو` : ''}</p>{exercise.note && <small>{exercise.note}</small>}<div className="actual-inputs"><label>وزنه واقعی<input type="number" value={result.actualWeight || ''} onChange={e => updateResult(exercise.id, 'actualWeight', Number(e.target.value))}/><span>kg</span></label><label>تکرار واقعی<input type="number" value={result.actualReps || ''} onChange={e => updateResult(exercise.id, 'actualReps', Number(e.target.value))}/></label></div></div></article>})}</div><button className="button primary full finish-workout" disabled={!completedCount} onClick={finishWorkout}>ثبت تمرین و پایان <Check size={18}/></button></div>
}

function ClientCheckIn({ student, updateStudent, done }: { student: Student; updateStudent: (student: Student) => void; done: () => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const now = new Date().toISOString()
    const checkIn: CheckIn = { id: crypto.randomUUID(), date: now, energy: Number(data.get('energy')), sleep: Number(data.get('sleep')), nutrition: 3, workoutCompletion: calculateAdherence(student, 7).percent, weight: Number(data.get('weight')), mood: Number(data.get('mood')), pain: '', note: String(data.get('note') || '') }
    updateStudent({ ...student, checkIns: [checkIn, ...student.checkIns], measurements: [{ id: crypto.randomUUID(), date: now, weight: checkIn.weight }, ...student.measurements], timeline: [{ id: crypto.randomUUID(), date: now, type: 'checkin', title: 'چک‌این هفتگی ثبت شد', body: `انرژی ${checkIn.energy} از ۵ · خواب ${checkIn.sleep} از ۵` }, ...student.timeline] }); done()
  }
  return <form className="client-checkin-card" onSubmit={submit}><div className="client-section-title"><small>چک‌این هفتگی</small><h1>این هفته چطور بود؟</h1><p>کمتر از دو دقیقه زمان می‌برد.</p></div><RangeField name="energy" label="انرژی" low="خیلی کم" high="عالی"/><RangeField name="sleep" label="کیفیت خواب" low="ضعیف" high="عالی"/><RangeField name="mood" label="احساس کلی" low="بد" high="عالی"/><label className="field-label">وزن فعلی<input name="weight" type="number" step="0.1" defaultValue={student.measurements[0]?.weight || student.checkIns[0]?.weight} required/><span>کیلوگرم</span></label><label className="textarea-label">نکته‌ای هست که مربی باید بداند؟<textarea name="note" rows={3} placeholder="مثلاً خستگی، درد یا سختی تمرین..."/></label><button className="button primary full" type="submit">ارسال برای مربی <ArrowLeft size={18}/></button></form>
}

function ClientApp({ students, selectedId, selectStudent, updateStudent, exit }: { students: Student[]; selectedId: string; selectStudent: (id: string) => void; updateStudent: (student: Student) => void; exit: () => void }) {
  const student = students.find(item => item.id === selectedId) || students[0]
  const [page, setPage] = useState<ClientPage>('home')
  const [activeDayId, setActiveDayId] = useState('')
  const [success, setSuccess] = useState('')
  if (!student) return null
  const todayDay = student.program.days.find(day => day.dayIndex === new Date().getDay()) || student.program.days[0]
  const activeDay = student.program.days.find(day => day.id === activeDayId) || todayDay
  const adherence = calculateAdherence(student)
  const completedToday = student.workoutLogs.some(log => dayDiff(log.date) === 0 && log.workoutDayId === todayDay?.id)
  const startWorkout = (day = todayDay) => { if (!day) return; setActiveDayId(day.id); setPage('workout'); setSuccess(''); window.scrollTo({ top: 0 }) }
  const navigate = (next: ClientPage) => { setPage(next); setSuccess(''); window.scrollTo({ top: 0 }) }
  return <div className="client-shell"><header className="client-header"><div className="client-logo"><Activity/><strong>همراه</strong></div><div className="client-header-actions"><select value={student.id} onChange={e => selectStudent(e.target.value)} aria-label="انتخاب شاگرد برای پیش‌نمایش">{students.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><button onClick={exit}>پنل مربی <ArrowLeft size={15}/></button></div></header><main className="client-content">
    {success && <div className="client-success"><Check/><span>{success}</span></div>}
    {page === 'home' && <><section className="client-welcome"><div><small>سلام {student.name.split(' ')[0]} 👋</small><h1>{completedToday ? 'تمرین امروز ثبت شد؛ آفرین!' : 'برای تمرین امروز آماده‌ای؟'}</h1></div><Avatar student={student}/></section><section className="goal-card"><div><Target/><span>هدف من</span></div><h2>{student.goal}</h2><p>پیشرفت با قدم‌های کوچک اما پیوسته ساخته می‌شود.</p></section>{todayDay && <section className={`today-workout-card ${completedToday ? 'is-done' : ''}`}><div className="today-label"><span>{completedToday ? <><Check/> انجام‌شده</> : 'تمرین امروز'}</span><small>{dayNames[todayDay.dayIndex]}</small></div><h2>{todayDay.title}</h2><div className="workout-meta"><span><Dumbbell/> {faNumber(todayDay.exercises.length)} حرکت</span><span><Clock3/> حدود ۵۰ دقیقه</span></div><div className="exercise-preview">{todayDay.exercises.slice(0, 3).map(exercise => <span key={exercise.id}>{exercise.name}<small>{faNumber(exercise.sets)} × {exercise.reps}</small></span>)}</div><button className="client-primary" onClick={() => startWorkout()}>{completedToday ? <><RotateCcw/> مشاهده و ثبت دوباره</> : <><Play/> شروع تمرین</>}</button></section>}<section className="client-week-card"><div className="client-card-heading"><div><small>این هفته</small><h3>روند انجام برنامه</h3></div><strong>{faNumber(adherence.percent)}٪</strong></div><div className="client-progress-bar"><i style={{ width: `${adherence.percent}%` }}/></div><p>{faNumber(adherence.completed)} تمرین از {faNumber(adherence.planned)} تمرین برنامه‌ریزی‌شده</p></section><button className="checkin-reminder" onClick={() => navigate('checkin')}><div><ClipboardCheck/><span><strong>چک‌این هفتگی</strong><small>حال این هفته‌ات را برای مربی ثبت کن</small></span></div><ChevronLeft/></button></>}
    {page === 'plan' && <section className="client-plan"><div className="client-section-title"><small>برنامه فعال</small><h1>برنامه هفتگی من</h1><p>{student.program.title}</p></div>{student.program.days.map((day, index) => <button key={day.id} className="client-plan-day" onClick={() => startWorkout(day)}><div className="day-badge"><small>روز</small><strong>{faNumber(index + 1)}</strong></div><div><small>{dayNames[day.dayIndex]}</small><h3>{day.title}</h3><p>{day.exercises.map(exercise => exercise.name).join(' · ')}</p></div><ChevronLeft/></button>)}</section>}
    {page === 'workout' && activeDay && <ClientWorkout student={student} day={activeDay} updateStudent={updateStudent} done={() => { setSuccess('تمرین با موفقیت برای مربی ثبت شد.'); setPage('home') }}/>} 
    {page === 'progress' && <section className="client-progress-page"><div className="client-section-title"><small>روند من</small><h1>پیشرفت</h1><p>نتیجه استمرار تو در یک نگاه</p></div><div className="client-progress-hero"><div className="adherence-ring" style={{ '--value': `${adherence.percent * 3.6}deg` } as CSSProperties}><div><strong>{faNumber(adherence.percent)}٪</strong><span>پایبندی</span></div></div><div><strong>{faNumber(student.workoutLogs.length)}</strong><span>تمرین ثبت‌شده</span></div><div><strong>{student.measurements[0]?.weight.toLocaleString('fa-IR')}</strong><span>وزن فعلی</span></div></div><div className="client-chart-card"><TrendChart student={student}/></div><div className="recent-workouts"><h3>تمرین‌های اخیر</h3>{student.workoutLogs.slice(0, 4).map(log => <div key={log.id}><i><Check/></i><span><strong>{log.workoutTitle}</strong><small>{faDate(log.date)}</small></span><b>{faNumber(log.results.filter(r => r.completed).length)} حرکت</b></div>)}</div></section>}
    {page === 'checkin' && <ClientCheckIn student={student} updateStudent={updateStudent} done={() => { setSuccess('چک‌این برای مربی ارسال شد.'); setPage('home') }}/>} 
  </main><nav className="client-bottom-nav"><button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}><LayoutDashboard/><span>خانه</span></button><button className={page === 'plan' || page === 'workout' ? 'active' : ''} onClick={() => navigate('plan')}><ListChecks/><span>برنامه</span></button><button className={page === 'progress' ? 'active' : ''} onClick={() => navigate('progress')}><BarChart3/><span>پیشرفت</span></button><button className={page === 'checkin' ? 'active' : ''} onClick={() => navigate('checkin')}><ClipboardCheck/><span>چک‌این</span></button></nav></div>
}

function ExerciseLibrary() {
  const exercises = ['اسکوات جام', 'هیپ تراست', 'ددلیفت رومانیایی', 'پرس سینه دمبل', 'لت از جلو', 'پرس پا']
  return <><Header title="کتابخانه تمرین" eyebrow="بانک حرکات مربی" onMenu={() => document.body.classList.add('menu-request')} /><main className="page"><div className="toolbar"><div className="search-box"><Search size={19}/><input placeholder="جست‌وجوی حرکت یا عضله هدف..."/></div><button className="button primary"><Plus size={18}/> حرکت جدید</button></div><section className="exercise-library">{exercises.map((name, index) => <article className="panel exercise-library-card" key={name}><div className="exercise-visual"><Dumbbell/></div><div><small>{index % 2 ? 'پایین‌تنه' : 'بالاتنه و قدرت'}</small><h3>{name}</h3><p>راهنمای اجرای صحیح، عضلات درگیر و نکات مربی</p></div><button><ChevronLeft/></button></article>)}</section></main></>
}

function CoachBottomNav({ page, navigate, quick }: { page: Page; navigate: (page: Page) => void; quick: () => void }) {
  return <nav className="coach-bottom-nav"><button className={page === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}><LayoutDashboard/><span>خانه</span></button><button className={page === 'students' || page === 'profile' ? 'active' : ''} onClick={() => navigate('students')}><Users/><span>شاگردها</span></button><button className="coach-fab" onClick={quick} aria-label="اقدام سریع"><Plus/></button><button className={page === 'library' ? 'active' : ''} onClick={() => navigate('library')}><BookOpen/><span>کتابخانه</span></button><button className={page === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><CircleUserRound/><span>پروفایل</span></button></nav>
}

function SettingsPage({ dark, toggleDark }: { dark: boolean; toggleDark: () => void }) {
  return <>
    <Header title="تنظیمات" eyebrow="حساب و فضای کار" onMenu={() => document.body.classList.add('menu-request')} />
    <main className="page settings-page">
      <section className="panel settings-card theme-setting">
        <div className="theme-preview" aria-hidden="true"><i/><i/><i/></div>
        <div><h2>حالت محیط باشگاه</h2><p>پس‌زمینه مات، نوشته‌های پرکنتراست و رنگ زمردی برای استفاده راحت در محیط کم‌نور.</p></div>
        <button className={`theme-button ${dark ? 'active' : ''}`} onClick={toggleDark}>{dark ? <Sun/> : <Moon/>}<span>{dark ? 'فعال؛ تغییر به روشن' : 'فعال‌کردن حالت تاریک'}</span></button>
      </section>
      <section className="panel settings-card"><h2>تنظیم تحلیل و هشدار</h2><p>آستانه‌های نسخه آزمایشی برای پایلوت مربی تنظیم شده‌اند.</p><div className="setting-row"><div><strong>هشدار پایبندی پایین</strong><span>وقتی کمتر از ۵۰٪ تمرین‌های ۱۴ روز اخیر انجام شده باشد</span></div><button className="toggle on"><i /></button></div><div className="setting-row"><div><strong>هشدار عدم فعالیت</strong><span>پس از ۱۴ روز بدون تمرین یا گزارش هفتگی</span></div><button className="toggle on"><i /></button></div><div className="setting-row"><div><strong>هشدار افت عملکرد</strong><span>با کاهش وزنه یا تکرار در ثبت‌های متوالی</span></div><button className="toggle on"><i /></button></div></section>
      <section className="panel settings-card"><h2>حریم خصوصی</h2><p>این نسخه داده‌ها را فقط روی همین مرورگر نگه می‌دارد.</p><div className="privacy-banner"><AlertCircle/><span><strong>نسخه پایلوت محلی</strong> پیش از استفاده واقعی باید احراز هویت، رمزنگاری، رضایت شاگرد و حذف داده سمت سرور پیاده‌سازی شود.</span></div></section>
    </main>
  </>
}

function LoginPage({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>('coach')
  const [showPassword, setShowPassword] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onLogin(role) }
  return <main className="login-page">
    <section className="login-story">
      <div className="login-brand"><div className="brand-mark"><Activity/></div><strong>شاگردیتو</strong></div>
      <div className="story-copy"><span>ساخته‌شده برای مربی‌های حرفه‌ای</span><h1>همه‌ی شاگردها، برنامه‌ها و پیگیری‌ها؛ یک‌جا و مرتب.</h1><p>کمتر درگیر کارهای پراکنده شو و بیشتر روی نتیجه‌ی شاگردهات تمرکز کن.</p></div>
      <div className="iranian-pattern" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="login-proof"><div><strong>+۲۴٪</strong><span>نظم بیشتر در پیگیری</span></div><div><strong>۲ دقیقه</strong><span>تا ساخت برنامه جدید</span></div></div>
    </section>
    <section className="login-panel"><form className="login-card" onSubmit={submit}>
      <div className="mobile-login-brand"><Activity/><strong>شاگردیتو</strong></div>
      <span className="welcome-chip">خوش اومدی 👋</span><h2>وارد فضای کارت شو</h2><p>نقش کاربری را انتخاب کن و ادامه بده.</p>
      <div className="role-switch"><button type="button" className={role === 'coach' ? 'active' : ''} onClick={() => setRole('coach')}><Dumbbell size={18}/><span><b>مربی</b><small>مدیریت شاگردها</small></span></button><button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}><ShieldCheck size={18}/><span><b>مدیر سیستم</b><small>مدیریت مربی‌ها</small></span></button></div>
      <label>شماره موبایل<div className="login-input"><CircleUserRound size={19}/><input inputMode="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" required/></div></label>
      <label>رمز عبور<div className="login-input"><LockKeyhole size={19}/><input type={showPassword ? 'text' : 'password'} placeholder="حداقل ۶ کاراکتر" minLength={6} defaultValue="123456" required/><button type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? 'پنهان' : 'نمایش'}</button></div></label>
      <div className="login-help"><label><input type="checkbox" defaultChecked/> من را به خاطر بسپار</label><button type="button">رمزت یادت رفته؟</button></div>
      <button className="login-submit" type="submit">ورود به پنل {role === 'coach' ? 'مربی' : 'مدیریت'} <ArrowLeft size={19}/></button>
      <small className="demo-note">برای مشاهده نسخه نمایشی، هر شماره‌ای وارد کنید.</small>
    </form></section>
  </main>
}

function AdminPanel({ students, logout }: { students: Student[]; logout: () => void }) {
  const coaches = [
    { name: 'مهدی حسینی', specialty: 'بدنسازی و تناسب اندام', students: students.length, status: 'فعال' },
    { name: 'سارا مرادی', specialty: 'فیتنس بانوان', students: 18, status: 'فعال' },
    { name: 'علی رضوانی', specialty: 'آمادگی جسمانی', students: 11, status: 'در انتظار تأیید' },
  ]
  return <div className="admin-shell"><header className="admin-header"><div className="login-brand"><div className="brand-mark"><Activity/></div><strong>شاگردیتو</strong><span>مدیریت</span></div><button onClick={logout}><LogOut size={18}/> خروج</button></header><main className="admin-main">
    <div className="admin-title"><div><span>پنل مدیریت</span><h1>نمای کلی کسب‌وکار</h1><p>وضعیت مربی‌ها و فضای کاری شاگردیتو را یک‌جا ببینید.</p></div><button className="button primary"><UserPlus size={18}/> افزودن مربی</button></div>
    <section className="admin-stats"><article><i><UserCog/></i><span>مربی فعال<strong>۲۴</strong><small>۳ نفر این ماه اضافه شدند</small></span></article><article><i><Users/></i><span>کل شاگردها<strong>{faNumber(students.length + 142)}</strong><small>در ۲۴ فضای کاری</small></span></article><article><i><Building2/></i><span>اشتراک‌های حرفه‌ای<strong>۱۸</strong><small>۷۵٪ نرخ تبدیل</small></span></article></section>
    <section className="panel admin-table"><div className="panel-heading"><div><h3>مربی‌های اخیر</h3><p>مدیریت دسترسی و وضعیت حساب مربی‌ها</p></div><div className="search-box"><Search size={17}/><input placeholder="جست‌وجوی مربی..."/></div></div><div className="admin-row admin-row-head"><span>مربی</span><span>تخصص</span><span>شاگردها</span><span>وضعیت</span><span/></div>{coaches.map(coach => <div className="admin-row" key={coach.name}><span className="student-cell"><div className="coach-avatar">{coach.name.split(' ').map(x => x[0]).join('‌')}</div><b>{coach.name}</b></span><span>{coach.specialty}</span><span>{faNumber(coach.students)} نفر</span><span><i className={coach.status === 'فعال' ? 'admin-active' : 'admin-pending'}>{coach.status}</i></span><button>جزئیات</button></div>)}</section>
  </main></div>
}

function PublicProgramPage({ student }: { student: Student }) {
  const program = student.program
  const sentAt = program.sentAt ? new Date(program.sentAt) : new Date()
  return <main className="public-program-page"><header className="public-program-header"><div className="login-brand"><div className="brand-mark"><Activity/></div><strong>شاگردیتو</strong></div><span>برنامه تمرینی اختصاصی</span></header><section className="public-program-hero"><div><small>برنامه اختصاصی برای</small><h1>{student.name}</h1><p>{student.goal}</p><div className="public-meta"><span><UserCog size={16}/> مربی: {program.coachName || 'مهدی حسینی'}</span><span><CalendarDays size={16}/> ارسال شده در {new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(sentAt)}</span></div></div><div className="public-badge"><Dumbbell/><span>{faNumber(program.days.length)} جلسه در هفته</span></div></section><section className="public-program-content"><div className="public-program-title"><div><span>برنامه فعال</span><h2>{program.title}</h2></div><div className="public-plan-chip">نسخه اشتراکی</div></div><div className="public-days">{program.days.map((day, index) => <article className="public-day-card" key={day.id}><div className="public-day-top"><div className="day-number">{faNumber(index + 1)}</div><div><small>{dayNames[day.dayIndex]}</small><h3>{day.title}</h3></div><span>{faNumber(day.exercises.length)} حرکت</span></div><div className="public-exercises">{day.exercises.map(exercise => <div key={exercise.id}><span><b>{exercise.name}</b>{exercise.note && <small>{exercise.note}</small>}</span><strong>{faNumber(exercise.sets)} ست × {exercise.reps}{exercise.targetWeight ? ` · ${exercise.targetWeight.toLocaleString('fa-IR')} ک‌گ` : ''}</strong></div>)}</div></article>)}</div><footer className="public-program-footer"><Activity size={18}/><span>این برنامه در شاگردیتو ساخته شده و فقط برای شما قابل مشاهده است.</span></footer></section></main>
}

function AddStudentModal({ close, add }: { close: () => void; add: (student: Student) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get('name'))
    const now = new Date().toISOString()
    add({ id: crypto.randomUUID(), name, initials: name.split(' ').map(x => x[0]).slice(0,2).join('‌'), color: '#8aaea0', phone: String(data.get('phone')), goal: String(data.get('goal')), plan: String(data.get('plan')), joinedAt: now, lastContact: now, sessionsPlanned: 0, sessionsAttended: 0, program: { id: crypto.randomUUID(), title: 'برنامه هفتگی جدید', weekLabel: 'هفته جاری', updatedAt: now, days: [] }, workoutLogs: [], measurements: [], checkIns: [], timeline: [{ id: crypto.randomUUID(), date: now, type: 'note', title: 'شاگرد اضافه شد', body: 'پروفایل شاگرد در شاگردیتو ساخته شد.' }] })
  }
  return <div className="modal-layer"><form className="modal" onSubmit={submit}><button type="button" className="modal-close" onClick={close}><X/></button><div className="modal-icon"><UserPlus/></div><h2>افزودن شاگرد جدید</h2><p>برای شروع فقط اطلاعات ضروری را وارد کنید.</p><label>نام و نام خانوادگی<input name="name" required placeholder="مثلاً الهام محمودی" /></label><div className="two-fields"><label>شماره تماس<input name="phone" required placeholder="۰۹۱۲..." /></label><label>نوع همکاری<select name="plan"><option>حضوری</option><option>آنلاین</option><option>حضوری + آنلاین</option></select></label></div><label>هدف اصلی<input name="goal" required placeholder="مثلاً کاهش وزن و تناسب اندام" /></label><button className="button primary full" type="submit">ساخت پروفایل شاگرد</button></form></div>
}

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEY); const parsed = saved ? JSON.parse(saved) as Student[] : null; return parsed?.every(student => student.program && student.workoutLogs && student.measurements) ? parsed : seedStudents } catch { return seedStudents } })
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedId, setSelectedId] = useState<string>(seedStudents[0].id)
  const [role, setRole] = useState<UserRole | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('hamrah-theme') === 'dark')
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)) }, [students])
  useEffect(() => { localStorage.setItem('hamrah-theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); document.querySelector('.content-shell')?.scrollTo({ top: 0 }) }, [page])
  useEffect(() => {
    const observer = new MutationObserver(() => { if (document.body.classList.contains('menu-request')) { setMenuOpen(true); document.body.classList.remove('menu-request') } })
    observer.observe(document.body, { attributes: true }); return () => observer.disconnect()
  }, [])
  const openStudent = (id: string) => { setSelectedId(id); setPage('profile'); window.scrollTo({ top: 0 }) }
  const navigate = (next: Page) => { setPage(next); setMenuOpen(false); window.scrollTo({ top: 0, left: 0 }) }
  const updateStudent = (next: Student) => setStudents(current => current.map(s => s.id === next.id ? next : s))
  const selected = students.find(s => s.id === selectedId)
  const logout = () => { setRole(null); setPage('dashboard'); window.scrollTo({ top: 0 }) }
  const sharedProgramId = new URLSearchParams(window.location.search).get('program')
  const sharedStudent = sharedProgramId ? students.find(student => student.id === sharedProgramId) : undefined
  if (sharedStudent) return <PublicProgramPage student={sharedStudent}/>
  if (!role) return <LoginPage onLogin={setRole}/>
  if (role === 'admin') return <AdminPanel students={students} logout={logout}/>
  return <div className={`app-shell ${dark ? 'dark-theme' : ''}`}><Sidebar page={page} onNavigate={navigate} open={menuOpen} close={() => setMenuOpen(false)} logout={logout} /><div className="content-shell">
    {page === 'dashboard' && <Dashboard students={students} openStudent={openStudent} addStudent={() => setShowAdd(true)} navigate={navigate} />}
    {page === 'students' && <StudentsPage students={students} openStudent={openStudent} addStudent={() => setShowAdd(true)} />}
    {page === 'library' && <ExerciseLibrary />}
    {page === 'checkins' && <CheckInsPage students={students} updateStudent={updateStudent} />}
    {page === 'settings' && <SettingsPage dark={dark} toggleDark={() => setDark(value => !value)} />}
    {page === 'profile' && selected && <ProfilePage student={selected} updateStudent={updateStudent} goBack={() => navigate('students')} />}
  </div><CoachBottomNav page={page} navigate={navigate} quick={() => setShowQuick(true)}/>{showQuick && <div className="modal-layer quick-layer"><div className="quick-sheet"><div className="sheet-handle"/><h2>اقدام سریع</h2><button onClick={() => { setShowQuick(false); setShowAdd(true) }}><UserPlus/><span><b>افزودن شاگرد</b><small>ساخت پروفایل جدید</small></span></button><button onClick={() => { setShowQuick(false); navigate('library') }}><Dumbbell/><span><b>ساخت برنامه</b><small>انتخاب حرکت از کتابخانه</small></span></button><button onClick={() => { setShowQuick(false); navigate('checkins') }}><ClipboardCheck/><span><b>ثبت گزارش</b><small>افزودن رکورد هفتگی</small></span></button><button onClick={() => setDark(value => !value)}>{dark ? <Sun/> : <Moon/>}<span><b>{dark ? 'حالت روشن' : 'حالت تاریک باشگاه'}</b><small>کاهش درخشش صفحه</small></span></button><button className="sheet-close" onClick={() => setShowQuick(false)}>بستن</button></div></div>}{showAdd && <AddStudentModal close={() => setShowAdd(false)} add={student => { setStudents(s => [...s, student]); setShowAdd(false); openStudent(student.id) }} />}</div>
}
