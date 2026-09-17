import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import {
  Activity, AlertCircle, ArrowLeft, BarChart3, Bell, Bot, CalendarDays, Check,
  ChevronLeft, CircleUserRound, ClipboardCheck, Clock3, Dumbbell, FileText,
  LayoutDashboard, Menu, MessageCircle, Plus, Search, Send, Settings, Sparkles,
  Target, TrendingDown, UserPlus, Users, Weight, X, ListChecks, Play, Trophy, RotateCcw,
} from 'lucide-react'
import { analyzeStudent, answerStudentQuestion, calculateAdherence, dayDiff, getExerciseTrend } from './analysis'
import { seedStudents } from './data'
import type { CheckIn, ExercisePrescription, Student, StudentAnalysis, TimelineItem, WorkoutDay, WorkoutLog } from './types'

type Page = 'dashboard' | 'students' | 'checkins' | 'settings' | 'profile'
type ClientPage = 'home' | 'plan' | 'workout' | 'progress' | 'checkin'
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
  const labels = { attention: 'نیازمند توجه', watch: 'زیر نظر', stable: 'پایدار' }
  return <span className={`status-pill ${analysis.status}`}><i />{labels[analysis.status]}</span>
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
}

function Sidebar({ page, onNavigate, open, close, onClientPreview }: { page: Page; onNavigate: (page: Page) => void; open: boolean; close: () => void; onClientPreview: () => void }) {
  const nav = [
    { id: 'dashboard' as Page, label: 'امروز', icon: <LayoutDashboard size={19} /> },
    { id: 'students' as Page, label: 'شاگردها', icon: <Users size={19} /> },
    { id: 'checkins' as Page, label: 'چک‌این‌ها', icon: <ClipboardCheck size={19} /> },
  ]
  return <>
    {open && <button className="sidebar-backdrop" onClick={close} aria-label="بستن منو" />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <button className="mobile-close" onClick={close}><X /></button>
      <div className="brand"><div className="brand-mark"><Activity /></div><div><strong>همراه</strong><small>دستیار هوشمند مربی</small></div></div>
      <nav>
        <p className="nav-label">فضای کار</p>
        {nav.map(item => <button key={item.id} className={page === item.id || (page === 'profile' && item.id === 'students') ? 'active' : ''} onClick={() => { onNavigate(item.id); close() }}>{item.icon}<span>{item.label}</span>{item.id === 'dashboard' && <b>۳</b>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <button className="client-preview-button" onClick={onClientPreview}><CircleUserRound size={19} /><span>نمایش پنل شاگرد</span><ChevronLeft size={16} /></button>
        <button className={page === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}><Settings size={19} /><span>تنظیمات</span></button>
        <div className="coach-card"><div className="coach-avatar">م‌ح</div><div><strong>مهدی حسینی</strong><small>مربی شخصی</small></div><ChevronLeft size={17} /></div>
      </div>
    </aside>
  </>
}

function Header({ title, eyebrow, onMenu }: { title: string; eyebrow?: string; onMenu: () => void }) {
  return <header className="topbar">
    <div className="header-copy"><button className="menu-button" onClick={onMenu}><Menu /></button><div>{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1></div></div>
    <div className="header-actions"><button className="icon-button" title="اعلان‌ها"><Bell size={20} /><i /></button><span className="today-date">{fullDate()}</span></div>
  </header>
}

function Dashboard({ students, openStudent, addStudent, navigate }: { students: Student[]; openStudent: (id: string) => void; addStudent: () => void; navigate: (page: Page) => void }) {
  const ranked = useMemo(() => students.map(student => ({ student, analysis: analyzeStudent(student) })).sort((a, b) => b.analysis.score - a.analysis.score), [students])
  const attention = ranked.filter(item => item.analysis.status === 'attention')
  const watch = ranked.filter(item => item.analysis.status === 'watch')
  const stable = ranked.filter(item => item.analysis.status === 'stable')
  return <>
    <Header title="امروز چه کسانی به توجه نیاز دارند؟" eyebrow="صبح بخیر، مهدی 👋" onMenu={() => document.body.classList.add('menu-request')} />
    <main className="page dashboard-page">
      <section className="hero-strip">
        <div className="hero-orb"><Sparkles /></div>
        <div><h2>{attention.length ? `${faNumber(attention.length)} شاگرد بهتر است امروز پیگیری شوند` : 'همه‌چیز تحت کنترل است'}</h2><p>بر اساس آخرین چک‌این، حضور، روند تمرین و زمان آخرین ارتباط.</p></div>
        <div className="hero-stats"><span><b>{faNumber(attention.length)}</b>فوری</span><span><b>{faNumber(watch.length)}</b>زیر نظر</span><span><b>{faNumber(stable.length)}</b>پایدار</span></div>
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
          <div className="panel-heading"><div><h3>در انتظار چک‌این</h3><p>شاگردانی که فرم این هفته را نفرستاده‌اند</p></div><button className="text-button" onClick={() => navigate('checkins')}>مشاهده همه</button></div>
          <div className="compact-list">{ranked.filter(x => !x.student.checkIns[0] || dayDiff(x.student.checkIns[0].date) > 7).slice(0, 4).map(({ student }) => <button key={student.id} onClick={() => openStudent(student.id)}><Avatar student={student} size="sm" /><span><strong>{student.name}</strong><small>آخرین چک‌این: {relativeDate(student.checkIns[0]?.date || student.joinedAt)}</small></span><ChevronLeft size={18} /></button>)}</div>
        </div>
        <div className="panel weekly-panel">
          <div className="panel-heading"><div><h3>نبض این هفته</h3><p>خلاصه وضعیت همه شاگردها</p></div><BarChart3 size={21} /></div>
          <div className="pulse-row"><div className="pulse-value positive">+۱۲٪</div><div><strong>انجام تمرین</strong><span>نسبت به هفته قبل</span></div><div className="mini-bars"><i style={{ height: '35%' }} /><i style={{ height: '48%' }} /><i style={{ height: '42%' }} /><i style={{ height: '67%' }} /><i style={{ height: '76%' }} /><i style={{ height: '82%' }} /></div></div>
          <div className="metrics-row"><div><span>میانگین انرژی</span><b>۳٫۶ <small>/ ۵</small></b></div><div><span>نرخ پاسخ چک‌این</span><b>۷۸٪</b></div><div><span>جلسات انجام‌شده</span><b>۴۷</b></div></div>
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
    <div className="filter-tabs">{([['all', 'همه'], ['attention', 'نیازمند توجه'], ['watch', 'زیر نظر'], ['stable', 'پایدار']] as const).map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <section className="students-table panel">
      <div className="table-head"><span>شاگرد</span><span>هدف</span><span>آخرین چک‌این</span><span>انجام جلسات</span><span>وضعیت</span><span /></div>
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
  const library = ['Hip Thrust', 'Goblet Squat', 'Romanian Deadlift', 'Lat Pulldown', 'Dumbbell Press', 'Leg Press']
  const updateExercise = (dayId: string, exerciseId: string, field: keyof ExercisePrescription, value: string | number) => {
    updateStudent({ ...student, program: { ...student.program, updatedAt: new Date().toISOString(), days: student.program.days.map(day => day.id !== dayId ? day : { ...day, exercises: day.exercises.map(exercise => exercise.id !== exerciseId ? exercise : { ...exercise, [field]: value }) }) } })
  }
  const addExercise = (dayId: string, name: string) => {
    const exercise: ExercisePrescription = { id: crypto.randomUUID(), name, sets: 3, reps: '۱۰', targetWeight: 0 }
    updateStudent({ ...student, program: { ...student.program, updatedAt: new Date().toISOString(), days: student.program.days.map(day => day.id === dayId ? { ...day, exercises: [...day.exercises, exercise] } : day) } })
  }
  const addDay = () => {
    const day: WorkoutDay = { id: crypto.randomUUID(), dayIndex: (student.program.days.at(-1)?.dayIndex ?? 0) + 1 > 6 ? 0 : (student.program.days.at(-1)?.dayIndex ?? 0) + 1, title: 'جلسه جدید', exercises: [] }
    updateStudent({ ...student, program: { ...student.program, updatedAt: new Date().toISOString(), days: [...student.program.days, day] } })
  }
  return <section className="program-panel">
    <div className="program-toolbar"><div><small>برنامه فعال</small><h2>{student.program.title}</h2><p>{faNumber(student.program.days.length)} جلسه در هفته · آخرین ویرایش {relativeDate(student.program.updatedAt)}</p></div><button className="button secondary" onClick={addDay}><Plus size={17}/> افزودن روز</button></div>
    <div className="program-days">{student.program.days.map((day, dayIndex) => <article className="program-day panel" key={day.id}><div className="program-day-head"><div className="day-number">{faNumber(dayIndex + 1)}</div><div><strong>{day.title}</strong><span>{dayNames[day.dayIndex]}</span></div><span>{faNumber(day.exercises.length)} حرکت</span></div>
      <div className="exercise-editor-head"><span>حرکت</span><span>ست</span><span>تکرار</span><span>وزنه هدف</span></div>
      {day.exercises.map(exercise => <div className="exercise-editor-row" key={exercise.id}><div><strong>{exercise.name}</strong>{exercise.note && <small>{exercise.note}</small>}</div><input type="number" value={exercise.sets} min="1" onChange={e => updateExercise(day.id, exercise.id, 'sets', Number(e.target.value))}/><input value={exercise.reps} onChange={e => updateExercise(day.id, exercise.id, 'reps', e.target.value)}/><label><input type="number" value={exercise.targetWeight || ''} min="0" onChange={e => updateExercise(day.id, exercise.id, 'targetWeight', Number(e.target.value))}/><small>kg</small></label></div>)}
      <div className="library-add"><span>افزودن سریع:</span>{library.filter(name => !day.exercises.some(ex => ex.name === name)).slice(0, 3).map(name => <button key={name} onClick={() => addExercise(day.id, name)}><Plus size={12}/>{name}</button>)}</div>
    </article>)}</div>
  </section>
}

function ProgressPanel({ student }: { student: Student }) {
  const adherence = calculateAdherence(student)
  const trend = getExerciseTrend(student)
  return <div className="progress-layout"><section className="panel progress-summary"><div className="adherence-ring" style={{ '--value': `${adherence.percent * 3.6}deg` } as CSSProperties}><div><strong>{faNumber(adherence.percent)}٪</strong><span>پایبندی</span></div></div><div><small>۱۴ روز اخیر</small><h2>{faNumber(adherence.completed)} از {faNumber(adherence.planned)} تمرین</h2><p>{adherence.percent >= 75 ? 'روند انجام برنامه خوب است.' : 'انجام برنامه کمتر از هدف تعیین‌شده است.'}</p></div></section><section className="panel performance-card"><div className="panel-heading"><div><h3>روند عملکرد</h3><p>Hip Thrust · ثبت‌های اخیر</p></div><Trophy size={20}/></div><div className="performance-values">{trend.values.slice(-5).map((value, index) => <div key={value.date}><span>هفته {faNumber(index + 1)}</span><b>{value.weight.toLocaleString('fa-IR')} kg × {faNumber(value.reps)}</b></div>)}</div><div className={`trend-result ${trend.state}`}><TrendingDown size={17}/><span>{trend.state === 'improving' ? `${trend.change.toLocaleString('fa-IR')} کیلوگرم پیشرفت ثبت شده` : trend.state === 'plateau' ? 'سه ثبت متوالی بدون تغییر' : trend.state === 'decline' ? 'کاهش عملکرد نیازمند بررسی است' : 'داده بیشتری برای تشخیص روند لازم است'}</span></div></section><section className="panel measurement-card"><div className="panel-heading"><div><h3>اندازه‌گیری‌ها</h3><p>آخرین تغییرات بدن</p></div><Weight size={19}/></div>{student.measurements.map(item => <div className="measurement-row" key={item.id}><time>{faDate(item.date)}</time><span><small>وزن</small><b>{item.weight.toLocaleString('fa-IR')} kg</b></span><span><small>دور کمر</small><b>{item.waist?.toLocaleString('fa-IR') || '—'} cm</b></span><span><small>دور باسن</small><b>{item.hip?.toLocaleString('fa-IR') || '—'} cm</b></span></div>)}</section></div>
}

function CheckInHistory({ student }: { student: Student }) {
  return <section className="checkin-history panel"><div className="panel-heading"><div><h3>تاریخچه چک‌این‌ها</h3><p>تغییرات حال عمومی شاگرد در طول زمان</p></div><ClipboardCheck size={20}/></div>{student.checkIns.map(item => <div className="checkin-history-row" key={item.id}><time>{faDate(item.date)}</time><span><small>انرژی</small><b>{faNumber(item.energy)}/۵</b></span><span><small>خواب</small><b>{faNumber(item.sleep)}/۵</b></span><span><small>کیفیت تمرین</small><b>{faNumber(item.workoutCompletion)}٪</b></span><span className="checkin-note">{item.pain || item.note || 'بدون توضیح'}</span></div>)}</section>
}

function ProfilePage({ student, updateStudent, goBack }: { student: Student; updateStudent: (student: Student) => void; goBack: () => void }) {
  const analysis = analyzeStudent(student)
  const latest = student.checkIns[0]
  const [tab, setTab] = useState<'overview' | 'program' | 'progress' | 'checkins' | 'timeline' | 'assistant'>('overview')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([])
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

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
  return <><header className="profile-header"><button className="back-button" onClick={goBack}><ArrowLeft size={18} /> بازگشت</button><div className="profile-actions"><button className="button secondary" onClick={() => setShowNote(true)}><FileText size={17} /> یادداشت جدید</button><button className="button primary" onClick={markContact}><Check size={17} /> ثبت پیگیری</button></div></header><main className="page profile-page">
    <section className="profile-identity"><Avatar student={student} size="lg" /><div><div className="name-line"><h1>{student.name}</h1><StatusPill analysis={analysis} /></div><p>{student.goal} · {student.plan}</p><div className="identity-meta"><span><CircleUserRound /> عضو از {faDate(student.joinedAt)}</span><span><MessageCircle /> آخرین ارتباط {relativeDate(student.lastContact)}</span></div></div><div className={`attention-score ${analysis.status}`}><strong>{faNumber(analysis.score)}</strong><span>امتیاز توجه</span></div></section>
    <div className="profile-tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>نمای کلی</button><button className={tab === 'program' ? 'active' : ''} onClick={() => setTab('program')}>برنامه فعلی</button><button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>پیشرفت</button><button className={tab === 'checkins' ? 'active' : ''} onClick={() => setTab('checkins')}>چک‌این‌ها</button><button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>یادداشت و Timeline</button><button className={tab === 'assistant' ? 'active' : ''} onClick={() => setTab('assistant')}><Sparkles size={15} /> پرسش از همراه</button></div>

    {tab === 'overview' && <div className="profile-grid"><div className="profile-main">
      <section className={`insight-panel ${analysis.status}`}><div className="insight-heading"><div className="insight-icon"><Sparkles /></div><div><small>جمع‌بندی همراه</small><h2>{analysis.summary}</h2></div></div><div className="insight-signals">{analysis.signals.length ? analysis.signals.map(signal => <div key={signal.id}><i className={signal.tone}>{signal.tone === 'danger' ? <AlertCircle /> : <Activity />}</i><span><strong>{signal.label}</strong><small>{signal.detail}</small></span></div>) : <p>در اطلاعات اخیر نشانه نگران‌کننده‌ای دیده نشد.</p>}</div><div className="suggested-action"><Target size={19} /><div><small>بهترین اقدام بعدی</small><p>{analysis.action}</p></div><button onClick={markContact}>انجام شد</button></div></section>
      <section className="panel"><div className="panel-heading"><div><h3>آخرین وضعیت</h3><p>{latest ? `ثبت‌شده در ${faDate(latest.date)}` : 'هنوز چک‌این ثبت نشده'}</p></div></div>{latest && <div className="metric-cards"><div><Activity /><span>انرژی</span><b>{faNumber(latest.energy)} <small>/ ۵</small></b></div><div><Clock3 /><span>خواب</span><b>{faNumber(latest.sleep)} <small>/ ۵</small></b></div><div><Dumbbell /><span>انجام تمرین</span><b>{faNumber(latest.workoutCompletion)}٪</b></div><div><Weight /><span>وزن</span><b>{latest.weight.toLocaleString('fa-IR')} <small>ک‌گ</small></b></div></div>}</section>
      <section className="panel"><TrendChart student={student} /></section>
    </div><aside className="profile-side"><section className="panel quick-ask"><div className="bot-badge"><Bot /></div><h3>از همراه بپرسید</h3><p>درباره روند، یادداشت‌ها یا وضعیت این شاگرد سؤال کنید.</p><div className="ask-field"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="مثلاً: آخرین بار کی درد داشت؟" /><button onClick={() => ask()}><Send /></button></div><div className="suggestions"><button onClick={() => ask('چرا نیاز به توجه دارد؟')}>چرا نیاز به توجه دارد؟</button><button onClick={() => ask('روند وزنش چطور بوده؟')}>روند وزن چطور بوده؟</button><button onClick={() => ask('آیا سابقه درد دارد؟')}>سابقه درد دارد؟</button></div></section><section className="panel contact-card"><h3>اطلاعات شاگرد</h3><dl><div><dt>شماره تماس</dt><dd>{student.phone}</dd></div><div><dt>هدف</dt><dd>{student.goal}</dd></div><div><dt>نوع همکاری</dt><dd>{student.plan}</dd></div></dl></section></aside></div>}

    {tab === 'timeline' && <section className="timeline-layout"><div className="timeline panel">{student.timeline.map(item => <div className={`timeline-item ${item.important ? 'important' : ''}`} key={item.id}><div className="timeline-dot">{item.type === 'checkin' ? <ClipboardCheck /> : item.type === 'message' ? <MessageCircle /> : item.type === 'workout' ? <Dumbbell /> : <FileText />}</div><div><time>{faDate(item.date)} · {relativeDate(item.date)}</time><h3>{item.title}</h3><p>{item.body}</p></div></div>)}</div></section>}
    {tab === 'program' && <ProgramPanel student={student} updateStudent={updateStudent} />}
    {tab === 'progress' && <ProgressPanel student={student} />}
    {tab === 'checkins' && <CheckInHistory student={student} />}
    {tab === 'assistant' && <section className="assistant-view panel"><div className="assistant-intro"><div className="bot-badge"><Sparkles /></div><div><h2>درباره {student.name} بپرسید</h2><p>پاسخ‌ها بر اساس چک‌این‌ها، اندازه‌گیری‌ها و یادداشت‌های ثبت‌شده‌اند.</p></div></div><div className="chat-area">{messages.length === 0 && <div className="chat-prompts"><button onClick={() => ask('چرا نیاز به توجه دارد؟')}>چرا نیاز به توجه دارد؟</button><button onClick={() => ask('آخرین وضعیت خواب و انرژی چطور بوده؟')}>وضعیت خواب و انرژی؟</button><button onClick={() => ask('آخرین بار کی با او تماس داشتم؟')}>آخرین ارتباط چه زمانی بود؟</button></div>}{messages.map((message, index) => <div className="chat-pair" key={index}><p className="coach-message">{message.q}</p><div className="bot-message"><Sparkles size={17} /><p>{message.a}</p></div></div>)}</div><div className="chat-input"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="سؤال خود را بنویسید..." /><button onClick={() => ask()}><Send /></button></div><small className="ai-note">همراه ممکن است اشتباه کند؛ تصمیم نهایی با مربی است.</small></section>}
  </main>{showNote && <div className="modal-layer"><div className="modal small"><button className="modal-close" onClick={() => setShowNote(false)}><X /></button><h2>یادداشت جدید</h2><p>این یادداشت در حافظه و خط زمانی شاگرد باقی می‌ماند.</p><textarea autoFocus value={note} onChange={e => setNote(e.target.value)} placeholder="مثلاً: امروز هنگام اسکوات از درد زانوی راست گفت..." rows={5} /><button className="button primary full" onClick={saveNote}>ذخیره یادداشت</button></div></div>}</>
}

function CheckInsPage({ students, updateStudent }: { students: Student[]; updateStudent: (student: Student) => void }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id || '')
  const student = students.find(s => s.id === selectedId)!
  const [saved, setSaved] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget)
    const checkIn: CheckIn = { id: crypto.randomUUID(), date: new Date().toISOString(), energy: Number(data.get('energy')), sleep: Number(data.get('sleep')), nutrition: Number(data.get('nutrition')), workoutCompletion: Number(data.get('completion')), weight: Number(data.get('weight')), mood: Number(data.get('mood')), pain: String(data.get('pain') || ''), note: String(data.get('note') || '') }
    updateStudent({ ...student, checkIns: [checkIn, ...student.checkIns], timeline: [{ id: crypto.randomUUID(), date: checkIn.date, type: 'checkin', title: 'چک‌این هفتگی ثبت شد', body: `انرژی ${checkIn.energy} از ۵ · انجام تمرین ${checkIn.workoutCompletion}٪`, important: Boolean(checkIn.pain) }, ...student.timeline] }); setSaved(true)
  }
  return <><Header title="چک‌این هفتگی" eyebrow="فرم آزمایشی شاگرد" onMenu={() => document.body.classList.add('menu-request')} /><main className="page"><div className="checkin-layout"><section className="panel checkin-info"><div className="form-brand"><Activity /> همراه</div><h2>این هفته چطور گذشت؟</h2><p>پاسخ‌های کوتاه شما به مربی کمک می‌کند برنامه مناسب‌تری تنظیم کند.</p><label>نمایش فرم برای شاگرد</label><select value={selectedId} onChange={e => { setSelectedId(e.target.value); setSaved(false) }}>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="privacy-note"><Check /><span><strong>اطلاعات شما محرمانه است</strong><small>پاسخ‌ها فقط برای مربی شما نمایش داده می‌شود.</small></span></div></section>
    <form className="panel checkin-form" onSubmit={submit}>{saved ? <div className="success-state"><div><Check /></div><h2>چک‌این با موفقیت ثبت شد</h2><p>پاسخ‌ها به پروفایل {student.name} اضافه و تحلیل او به‌روز شد.</p><button type="button" className="button secondary" onClick={() => setSaved(false)}>ثبت پاسخ دیگر</button></div> : <><h3>حال عمومی</h3><RangeField name="energy" label="سطح انرژی" low="خیلی کم" high="عالی" /><RangeField name="sleep" label="کیفیت خواب" low="ضعیف" high="عالی" /><RangeField name="mood" label="حال و روحیه" low="بد" high="عالی" /><RangeField name="nutrition" label="رعایت تغذیه" low="کم" high="کامل" /><hr/><h3>تمرین و بدن</h3><label className="field-label">چند درصد تمرین‌ها را انجام دادید؟<input name="completion" type="number" min="0" max="100" defaultValue="80" required/><span>درصد</span></label><label className="field-label">وزن فعلی<input name="weight" type="number" step="0.1" min="30" max="250" defaultValue={student.checkIns[0]?.weight || 70} required/><span>کیلوگرم</span></label><label className="textarea-label">این هفته درد یا ناراحتی جدیدی داشتید؟<textarea name="pain" rows={2} placeholder="اگر موردی نیست، خالی بگذارید." /></label><label className="textarea-label">توضیح دیگری برای مربی دارید؟<textarea name="note" rows={3} placeholder="هر چیزی که فکر می‌کنید مربی باید بداند..." /></label><button className="button primary full" type="submit">ثبت چک‌این <ArrowLeft size={18}/></button></>}</form></div></main></>
}

function RangeField({ name, label, low, high }: { name: string; label: string; low: string; high: string }) {
  const [value, setValue] = useState(3)
  return <label className="range-field"><span><b>{label}</b><strong>{faNumber(value)} از ۵</strong></span><input name={name} type="range" min="1" max="5" value={value} onChange={e => setValue(Number(e.target.value))}/><small><i>{low}</i><i>{high}</i></small></label>
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

function SettingsPage() {
  return <><Header title="تنظیمات" eyebrow="حساب و فضای کار" onMenu={() => document.body.classList.add('menu-request')} /><main className="page settings-page"><section className="panel settings-card"><h2>تنظیم تحلیل و هشدار</h2><p>آستانه‌های نسخه آزمایشی برای پایلوت مربی تنظیم شده‌اند.</p><div className="setting-row"><div><strong>هشدار پایبندی پایین</strong><span>وقتی کمتر از ۵۰٪ تمرین‌های ۱۴ روز اخیر انجام شده باشد</span></div><button className="toggle on"><i /></button></div><div className="setting-row"><div><strong>هشدار عدم فعالیت</strong><span>پس از ۱۴ روز بدون تمرین یا چک‌این</span></div><button className="toggle on"><i /></button></div><div className="setting-row"><div><strong>هشدار افت عملکرد</strong><span>با کاهش وزنه یا تکرار در ثبت‌های متوالی</span></div><button className="toggle on"><i /></button></div></section><section className="panel settings-card"><h2>حریم خصوصی</h2><p>این نسخه داده‌ها را فقط روی همین مرورگر نگه می‌دارد.</p><div className="privacy-banner"><AlertCircle/><span><strong>نسخه پایلوت محلی</strong> پیش از استفاده واقعی باید احراز هویت، رمزنگاری، رضایت شاگرد و حذف داده سمت سرور پیاده‌سازی شود.</span></div></section></main></>
}

function AddStudentModal({ close, add }: { close: () => void; add: (student: Student) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get('name'))
    const now = new Date().toISOString()
    add({ id: crypto.randomUUID(), name, initials: name.split(' ').map(x => x[0]).slice(0,2).join('‌'), color: '#8aaea0', phone: String(data.get('phone')), goal: String(data.get('goal')), plan: String(data.get('plan')), joinedAt: now, lastContact: now, sessionsPlanned: 0, sessionsAttended: 0, program: { id: crypto.randomUUID(), title: 'برنامه هفتگی جدید', weekLabel: 'هفته جاری', updatedAt: now, days: [] }, workoutLogs: [], measurements: [], checkIns: [], timeline: [{ id: crypto.randomUUID(), date: now, type: 'note', title: 'شاگرد اضافه شد', body: 'پروفایل شاگرد در همراه ساخته شد.' }] })
  }
  return <div className="modal-layer"><form className="modal" onSubmit={submit}><button type="button" className="modal-close" onClick={close}><X/></button><div className="modal-icon"><UserPlus/></div><h2>افزودن شاگرد جدید</h2><p>برای شروع فقط اطلاعات ضروری را وارد کنید.</p><label>نام و نام خانوادگی<input name="name" required placeholder="مثلاً الهام محمودی" /></label><div className="two-fields"><label>شماره تماس<input name="phone" required placeholder="۰۹۱۲..." /></label><label>نوع همکاری<select name="plan"><option>حضوری</option><option>آنلاین</option><option>حضوری + آنلاین</option></select></label></div><label>هدف اصلی<input name="goal" required placeholder="مثلاً کاهش وزن و تناسب اندام" /></label><button className="button primary full" type="submit">ساخت پروفایل شاگرد</button></form></div>
}

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEY); const parsed = saved ? JSON.parse(saved) as Student[] : null; return parsed?.every(student => student.program && student.workoutLogs && student.measurements) ? parsed : seedStudents } catch { return seedStudents } })
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedId, setSelectedId] = useState<string>(seedStudents[0].id)
  const [mode, setMode] = useState<'coach' | 'client'>('coach')
  const [showAdd, setShowAdd] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)) }, [students])
  useEffect(() => {
    const observer = new MutationObserver(() => { if (document.body.classList.contains('menu-request')) { setMenuOpen(true); document.body.classList.remove('menu-request') } })
    observer.observe(document.body, { attributes: true }); return () => observer.disconnect()
  }, [])
  const openStudent = (id: string) => { setSelectedId(id); setPage('profile'); window.scrollTo({ top: 0 }) }
  const updateStudent = (next: Student) => setStudents(current => current.map(s => s.id === next.id ? next : s))
  const selected = students.find(s => s.id === selectedId)
  if (mode === 'client') return <ClientApp students={students} selectedId={selectedId} selectStudent={setSelectedId} updateStudent={updateStudent} exit={() => setMode('coach')} />
  return <div className="app-shell"><Sidebar page={page} onNavigate={setPage} open={menuOpen} close={() => setMenuOpen(false)} onClientPreview={() => setMode('client')} /><div className="content-shell">
    {page === 'dashboard' && <Dashboard students={students} openStudent={openStudent} addStudent={() => setShowAdd(true)} navigate={setPage} />}
    {page === 'students' && <StudentsPage students={students} openStudent={openStudent} addStudent={() => setShowAdd(true)} />}
    {page === 'checkins' && <CheckInsPage students={students} updateStudent={updateStudent} />}
    {page === 'settings' && <SettingsPage />}
    {page === 'profile' && selected && <ProfilePage student={selected} updateStudent={updateStudent} goBack={() => setPage('students')} />}
  </div>{showAdd && <AddStudentModal close={() => setShowAdd(false)} add={student => { setStudents(s => [...s, student]); setShowAdd(false); openStudent(student.id) }} />}</div>
}
