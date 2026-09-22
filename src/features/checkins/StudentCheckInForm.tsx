import { type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { RangeField } from './RangeField'
import type { CheckIn, Student } from '../../types'
import { calculateAdherence } from '../../analysis'
import { faNumber } from '../../lib/numbers'
import type { StudentActions } from '../../services/students/studentActions'

export function ClientCheckIn({ student, actions, done }: { student: Student; actions: StudentActions; done: () => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const now = new Date().toISOString()
    const checkIn: CheckIn = { id: crypto.randomUUID(), date: now, energy: Number(data.get('energy')), sleep: Number(data.get('sleep')), sleepHours: data.get('sleepHours') ? Number(data.get('sleepHours')) : undefined, nutrition: 3, workoutCompletion: calculateAdherence(student, 7).percent, weight: Number(data.get('weight')), mood: Number(data.get('mood')), pain: String(data.get('pain') || ''), note: String(data.get('note') || '') }
    actions.recordCheckIn(student.id, checkIn); done()
  }
  const progress = calculateAdherence(student, 7)
  return <form className="client-checkin-card" onSubmit={submit}><div className="client-section-title"><small>چک‌این هفتگی</small><h1>این هفته چطور بود؟</h1><p>کمتر از دو دقیقه زمان می‌برد.</p></div><div className="checkin-progress"><span>روند تمرین این هفته: {faNumber(progress.percent)}٪</span><div className="client-progress-bar"><i style={{ width: `${progress.percent}%` }}/></div></div><RangeField name="energy" label="انرژی" low="خیلی کم" high="عالی"/><RangeField name="sleep" label="کیفیت خواب" low="ضعیف" high="عالی"/><RangeField name="mood" label="احساس کلی" low="بد" high="عالی"/><label className="field-label">میانگین خواب شبانه<input name="sleepHours" type="number" min="0" max="24" step="0.1" inputMode="decimal" placeholder="مثلاً ۶٫۲"/><span>ساعت</span></label><label className="field-label">محل درد (در صورت وجود)<input name="pain" type="text" placeholder="مثلاً زانو یا کمر"/></label><label className="field-label">وزن فعلی<input name="weight" type="number" step="0.1" defaultValue={student.measurements[0]?.weight || student.checkIns[0]?.weight} required/><span>کیلوگرم</span></label><label className="textarea-label">نکته‌ای هست که مربی باید بداند؟<textarea name="note" rows={3} placeholder="مثلاً خستگی، درد یا سختی تمرین..."/></label><button className="button primary full" type="submit">ارسال گزارش هفتگی <ArrowLeft size={18}/></button></form>
}
