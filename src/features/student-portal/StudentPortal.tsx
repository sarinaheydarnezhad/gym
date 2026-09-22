import { useState, type CSSProperties, type FormEvent } from 'react'
import { Activity, BarChart3, Check, ChevronLeft, ClipboardCheck, Clock3, Dumbbell, LayoutDashboard, Send, Target, ListChecks, Play, RotateCcw } from 'lucide-react'
import { Avatar } from '../../components/common/Avatar'
import { TrendChart } from '../../features/progress/TrendChart'
import { ClientWorkout } from '../../features/workouts/StudentWorkout'
import { WorkoutFeedback } from '../../features/workouts/WorkoutFeedback'
import { ClientCheckIn } from '../../features/checkins/StudentCheckInForm'
import type { ExerciseResult, Student, WorkoutDay, WorkoutLog, ClientPage } from '../../types'
import { calculateAdherence } from '../../analysis'
import { dayDiff, dayNames, faDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'
import type { StudentActions } from '../../services/students/studentActions'
import { StudentLayout } from '../../layouts/StudentLayout'

export function ClientApp({ student, actions }: { student: Student; actions: StudentActions }) {
  const [page, setPage] = useState<ClientPage>(() => new URLSearchParams(window.location.search).get('view') === 'checkin' ? 'checkin' : 'home')
  const [activeDayId, setActiveDayId] = useState('')
  const [pendingWorkout, setPendingWorkout] = useState<{ day: WorkoutDay; results: ExerciseResult[] } | null>(null)
  const [success, setSuccess] = useState('')
  const [message, setMessage] = useState('')
  const todayDay = student.program.days.find(day => day.dayIndex === new Date().getDay()) || student.program.days[0]
  const activeDay = student.program.days.find(day => day.id === activeDayId) || todayDay
  const adherence = calculateAdherence(student)
  const completedToday = student.workoutLogs.some(log => dayDiff(log.date) === 0 && log.workoutDayId === todayDay?.id)
  const startWorkout = (day = todayDay) => { if (!day) return; setActiveDayId(day.id); setPage('workout'); setSuccess(''); window.scrollTo({ top: 0 }) }
  const navigate = (next: ClientPage) => { setPage(next); setSuccess(''); window.scrollTo({ top: 0 }) }
  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = message.trim()
    if (!body) return
    actions.sendMessage(student.id, body)
    setMessage(''); setSuccess('پیامت در صندوق مربی ثبت شد.')
  }
  const submitWorkout = (feedback: string) => {
    if (!pendingWorkout) return
    const { day, results } = pendingWorkout
    actions.recordWorkout(student.id, day, results, feedback)
    setPendingWorkout(null); setSuccess('تمرین و بازخوردت ثبت شد.'); setPage('home')
  }
  return <StudentLayout><header className="client-header"><div className="client-logo"><Activity/><strong>شاگردیتو</strong></div><span className="client-student-name">برنامه اختصاصی {student.name}</span></header><main className="client-content">
    {success && <div className="client-success"><Check/><span>{success}</span></div>}
    {page === 'home' && <><section className="client-welcome"><div><small>سلام {student.name.split(' ')[0]} 👋</small><h1>{completedToday ? 'تمرین امروز ثبت شد؛ آفرین!' : 'برای تمرین امروز آماده‌ای؟'}</h1></div><Avatar student={student}/></section><section className="goal-card"><div><Target/><span>هدف من</span></div><h2>{student.goal}</h2><p>پیشرفت با قدم‌های کوچک اما پیوسته ساخته می‌شود.</p></section>{todayDay && <section className={`today-workout-card ${completedToday ? 'is-done' : ''}`}><div className="today-label"><span>{completedToday ? <><Check/> انجام‌شده</> : 'تمرین امروز'}</span><small>{dayNames[todayDay.dayIndex]}</small></div><h2>{todayDay.title}</h2><div className="workout-meta"><span><Dumbbell/> {faNumber(todayDay.exercises.length)} حرکت</span><span><Clock3/> حدود ۵۰ دقیقه</span></div><div className="exercise-preview">{todayDay.exercises.slice(0, 3).map(exercise => <span key={exercise.id}>{exercise.name}<small>{faNumber(exercise.sets)} × {exercise.reps}</small></span>)}</div><button className="client-primary" onClick={() => startWorkout()}>{completedToday ? <><RotateCcw/> مشاهده و ثبت دوباره</> : <><Play/> شروع تمرین</>}</button></section>}<section className="client-week-card"><div className="client-card-heading"><div><small>این هفته</small><h3>روند انجام برنامه</h3></div><strong>{faNumber(adherence.percent)}٪</strong></div><div className="client-progress-bar"><i style={{ width: `${adherence.percent}%` }}/></div><p>{faNumber(adherence.completed)} تمرین از {faNumber(adherence.planned)} تمرین برنامه‌ریزی‌شده</p></section><button className="checkin-reminder" onClick={() => navigate('checkin')}><div><ClipboardCheck/><span><strong>چک‌این هفتگی</strong><small>حال این هفته‌ات را برای مربی ثبت کن</small></span></div><ChevronLeft/></button></>}
    {page === 'home' && <form className="client-message-form client-week-card" onSubmit={sendMessage}><h3>پیام به مربی</h3><textarea value={message} onChange={event => setMessage(event.target.value)} placeholder="سؤال یا نکته‌ای برای مربی بنویس..." rows={2} required/><button className="client-primary" type="submit"><Send size={17}/> ارسال پیام</button></form>}
    {page === 'plan' && <section className="client-plan"><div className="client-section-title"><small>برنامه فعال</small><h1>برنامه هفتگی من</h1><p>{student.program.title}</p></div>{student.program.days.map((day, index) => <button key={day.id} className="client-plan-day" onClick={() => startWorkout(day)}><div className="day-badge"><small>روز</small><strong>{faNumber(index + 1)}</strong></div><div><small>{dayNames[day.dayIndex]}</small><h3>{day.title}</h3><p>{day.exercises.map(exercise => exercise.name).join(' · ')}</p></div><ChevronLeft/></button>)}</section>}
    {page === 'workout' && activeDay && (
      <ClientWorkout key={activeDay.id} day={activeDay} review={results => {
        setPendingWorkout({ day: activeDay, results }); setPage('feedback')
      }}/>
    )}
    {page === 'feedback' && pendingWorkout && <WorkoutFeedback submit={submitWorkout}/>}
    {page === 'progress' && <section className="client-progress-page"><div className="client-section-title"><small>روند من</small><h1>پیشرفت</h1><p>نتیجه استمرار تو در یک نگاه</p></div><div className="client-progress-hero"><div className="adherence-ring" style={{ '--value': `${adherence.percent * 3.6}deg` } as CSSProperties}><div><strong>{faNumber(adherence.percent)}٪</strong><span>پایبندی</span></div></div><div><strong>{faNumber(student.workoutLogs.length)}</strong><span>تمرین ثبت‌شده</span></div><div><strong>{student.measurements[0]?.weight.toLocaleString('fa-IR')}</strong><span>وزن فعلی</span></div></div><div className="client-chart-card"><TrendChart student={student}/></div><div className="recent-workouts"><h3>تمرین‌های اخیر</h3>{student.workoutLogs.slice(0, 4).map(log => <div key={log.id}><i><Check/></i><span><strong>{log.workoutTitle}</strong><small>{faDate(log.date)}</small></span><b>{faNumber(log.results.filter(r => r.completed).length)} حرکت</b></div>)}</div></section>}
    {page === 'checkin' && <ClientCheckIn student={student} actions={actions} done={() => { setSuccess('چک‌این برای مربی ارسال شد.'); setPage('home') }}/>} 
  </main><nav className="client-bottom-nav"><button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}><LayoutDashboard/><span>خانه</span></button><button className={page === 'plan' || page === 'workout' || page === 'feedback' ? 'active' : ''} onClick={() => navigate('plan')}><ListChecks/><span>برنامه</span></button><button className={page === 'progress' ? 'active' : ''} onClick={() => navigate('progress')}><BarChart3/><span>پیشرفت</span></button><button className={page === 'checkin' ? 'active' : ''} onClick={() => navigate('checkin')}><ClipboardCheck/><span>چک‌این</span></button></nav></StudentLayout>
}
