import { type FormEvent } from 'react'
import { UserPlus, X } from 'lucide-react'
import type { Student } from '../../types'

export function AddStudentModal({ close, add }: { close: () => void; add: (student: Student) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get('name'))
    const now = new Date().toISOString()
    add({ id: crypto.randomUUID(), name, initials: name.split(' ').map(x => x[0]).slice(0,2).join('‌'), color: '#8aaea0', phone: String(data.get('phone')), goal: String(data.get('goal')), plan: String(data.get('plan')), joinedAt: now, lastContact: now, sessionsPlanned: 0, sessionsAttended: 0, program: { id: crypto.randomUUID(), title: 'برنامه هفتگی جدید', weekLabel: 'هفته جاری', updatedAt: now, days: [] }, workoutLogs: [], measurements: [], checkIns: [], timeline: [{ id: crypto.randomUUID(), date: now, type: 'note', title: 'شاگرد اضافه شد', body: 'پروفایل شاگرد در شاگردیتو ساخته شد.' }] })
  }
  return <div className="modal-layer"><form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="add-student-title"><button type="button" className="modal-close" onClick={close} aria-label="بستن پنجره افزودن شاگرد"><X/></button><div className="modal-icon"><UserPlus/></div><h2 id="add-student-title">افزودن شاگرد جدید</h2><p>برای شروع فقط اطلاعات ضروری را وارد کنید.</p><label>نام و نام خانوادگی<input name="name" required placeholder="مثلاً الهام محمودی" /></label><div className="two-fields"><label>شماره تماس<input name="phone" inputMode="tel" required placeholder="۰۹۱۲..." /></label><label>نوع همکاری<select name="plan"><option>حضوری</option><option>آنلاین</option><option>حضوری + آنلاین</option></select></label></div><label>هدف اصلی<input name="goal" required placeholder="مثلاً کاهش وزن و تناسب اندام" /></label><button className="button primary full" type="submit">ساخت پروفایل شاگرد</button></form></div>
}
