import { useState } from 'react'
import { CalendarDays, ChevronDown, Dumbbell, Plus, X, Share2, UserCog } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'
import type { ExercisePrescription, Student, WorkoutDay } from '../../types'
import { dayNames, relativeDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'
import { studentShareUrl } from '../../services/sharing/links'
import type { StudentActions } from '../../services/students/studentActions'

export function ProgramPanel({ student, actions }: { student: Student; actions: StudentActions }) {
  const [customExercise, setCustomExercise] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [expandedDayId, setExpandedDayId] = useState<string | null>(student.program.days[0]?.id ?? null)
  const library = ['Hip Thrust', 'Goblet Squat', 'Romanian Deadlift', 'Lat Pulldown', 'Dumbbell Press', 'Leg Press']
  const touchProgram = (program: Student['program']) => actions.updateProgram(student.id, program)
  const updateExercise = (dayId: string, exerciseId: string, field: keyof ExercisePrescription, value: string | number) => {
    actions.updateProgramExercise(student.id, dayId, exerciseId, field, value)
  }
  const addExercise = (dayId: string, name: string) => {
    const exercise: ExercisePrescription = { id: crypto.randomUUID(), name, sets: 3, reps: '۱۰', targetWeight: 0 }
    actions.addProgramExercise(student.id, dayId, exercise)
  }
  const addCustomExercise = (dayId: string) => { const name = customExercise.trim(); if (!name) return; addExercise(dayId, name); setCustomExercise('') }
  const removeExercise = (dayId: string, exerciseId: string) => actions.removeProgramExercise(student.id, dayId, exerciseId)
  const renameDay = (dayId: string, title: string) => actions.renameProgramDay(student.id, dayId, title)
  const removeDay = (dayId: string) => actions.removeProgramDay(student.id, dayId)
  const addDay = () => {
    const day: WorkoutDay = { id: crypto.randomUUID(), dayIndex: (student.program.days.at(-1)?.dayIndex ?? 0) + 1 > 6 ? 0 : (student.program.days.at(-1)?.dayIndex ?? 0) + 1, title: 'جلسه جدید', exercises: [] }
    actions.addProgramDay(student.id, day)
    setExpandedDayId(day.id)
  }
  const share = async () => {
    const url = studentShareUrl(student.id)
    touchProgram({ ...student.program, sentAt: new Date().toISOString(), coachName: 'مهدی حسینی' })
    try { if (navigator.share) await navigator.share({ title: `برنامه تمرینی ${student.name}`, text: 'برنامه تمرینی اختصاصی شما آماده است.', url }); else await navigator.clipboard.writeText(url) } catch { /* dismissed */ }
    setShowShare(false)
  }
  return <section className="program-panel">
    <div className="program-toolbar"><div><small>برنامه فعال</small><input className="program-title-input" value={student.program.title} onChange={e => touchProgram({ ...student.program, title: e.target.value })}/><p>{faNumber(student.program.days.length)} جلسه در هفته · آخرین ویرایش {relativeDate(student.program.updatedAt)}</p></div><div className="program-toolbar-actions"><button className="button share-program" onClick={() => setShowShare(true)}><Share2 size={17}/> اشتراک‌گذاری برنامه</button><button className="button secondary" onClick={addDay}><Plus size={17}/> افزودن جلسه</button></div></div>
    <div className="program-days">{student.program.days.map((day, dayIndex) => <article className={`program-day panel ${expandedDayId === day.id ? 'expanded' : 'collapsed'}`} key={day.id}><div className="program-day-head"><div className="day-number">{faNumber(dayIndex + 1)}</div><div><input className="day-title-input" value={day.title} onChange={e => renameDay(day.id, e.target.value)} /><span>{dayNames[day.dayIndex]}</span></div><span>{faNumber(day.exercises.length)} حرکت</span><button type="button" className="day-collapse" aria-expanded={expandedDayId === day.id} aria-label={`${expandedDayId === day.id ? 'بستن' : 'باز کردن'} جلسه ${day.title}`} onClick={() => setExpandedDayId(current => current === day.id ? null : day.id)}><ChevronDown size={19}/></button><button className="delete-day" onClick={() => removeDay(day.id)} title="حذف جلسه"><X size={15}/></button></div>
      <div className="program-day-body"><div>
      <div className="exercise-editor-head"><span>حرکت</span><span>ست</span><span>تکرار</span><span>وزنه هدف</span></div>
      {day.exercises.map(exercise => <div className="exercise-editor-row" key={exercise.id}><div className="exercise-name"><strong>{exercise.name}</strong>{exercise.note && <small>{exercise.note}</small>}</div><div className="stepper-field"><span>ست</span><div className="stepper"><button type="button" onClick={() => updateExercise(day.id, exercise.id, 'sets', Math.max(1, exercise.sets - 1))}>−</button><input aria-label="تعداد ست" type="number" inputMode="numeric" value={exercise.sets} min="1" onChange={e => updateExercise(day.id, exercise.id, 'sets', Math.max(1, Number(e.target.value)))}/><button type="button" onClick={() => updateExercise(day.id, exercise.id, 'sets', exercise.sets + 1)}>+</button></div></div><label className="mobile-exercise-field"><span>تکرار</span><input className="number-input" type="number" inputMode="numeric" value={exercise.reps} onChange={e => updateExercise(day.id, exercise.id, 'reps', e.target.value)}/></label><label className="mobile-exercise-field weight-field"><span>وزنه هدف</span><input type="number" inputMode="decimal" value={exercise.targetWeight || ''} min="0" onChange={e => updateExercise(day.id, exercise.id, 'targetWeight', Number(e.target.value))}/><small>kg</small></label><button className="delete-exercise" onClick={() => removeExercise(day.id, exercise.id)} title="حذف حرکت"><X size={14}/></button></div>)}
      <div className="library-add"><span>افزودن سریع:</span>{library.filter(name => !day.exercises.some(ex => ex.name === name)).slice(0, 3).map(name => <button key={name} onClick={() => addExercise(day.id, name)}><Plus size={12}/>{name}</button>)}<div className="custom-exercise"><input value={customExercise} onChange={e => setCustomExercise(e.target.value)} placeholder="نام حرکت دلخواه مربی..." onKeyDown={e => e.key === 'Enter' && addCustomExercise(day.id)}/><button onClick={() => addCustomExercise(day.id)}><Plus size={14}/> افزودن حرکت</button></div></div>
      </div></div>
    </article>)}</div>
    {!student.program.days.length && <EmptyState icon={<Dumbbell/>} title="اولین جلسه را بسازید" text="جلسه جدید اضافه کنید و حرکت‌ها را خودتان بنویسید." />}
    {showShare && <div className="modal-layer"><div className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-program-title"><button className="modal-close" onClick={() => setShowShare(false)} aria-label="بستن پنجره اشتراک‌گذاری"><X/></button><div className="share-modal-icon"><Share2/></div><h2 id="share-program-title">اشتراک‌گذاری برنامه با {student.name}</h2><p>این لینک در نسخه آزمایشی فقط در مرورگری که اطلاعات شاگرد در آن ثبت شده کار می‌کند. ارسال آن به دستگاه دیگر به سرور و احراز هویت نیاز دارد.</p><button className="button primary full share-link-action" onClick={share}><Share2 size={17}/> ارسال یا کپی لینک برنامه</button><div className="share-meta"><span><UserCog size={15}/> مربی: مهدی حسینی</span><span><CalendarDays size={15}/> تاریخ ارسال: {new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span></div></div></div>}
  </section>
}
