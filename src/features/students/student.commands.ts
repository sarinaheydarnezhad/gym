import type { Student } from '../../types'

export function recordCoachFollowUp(student: Student, now: string, id: string, source: 'dashboard' | 'profile'): Student {
  return {
    ...student,
    lastContact: now,
    timeline: [{ id, date: now, type: 'message', title: source === 'dashboard' ? 'پیگیری از داشبورد انجام شد' : 'پیگیری انجام شد', body: source === 'dashboard' ? 'مربی پیگیری امروز را انجام‌شده علامت زد.' : 'تماس با شاگرد توسط مربی ثبت شد.' }, ...student.timeline],
  }
}

export function addCoachNote(student: Student, body: string, now: string, id: string): Student {
  return { ...student, timeline: [{ id, date: now, type: 'note', title: 'یادداشت مربی', body }, ...student.timeline] }
}
