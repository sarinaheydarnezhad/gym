import type { Student } from '../../types'
import { faNumber } from '../../lib/numbers'

export function buildInboxItems(students: Student[]) {
  return students.flatMap(student => [
    ...student.checkIns.map(report => ({ id: report.id, student, date: report.date, title: 'گزارش هفتگی جدید', body: [report.pain && `درد: ${report.pain}`, report.note].filter(Boolean).join(' · ') || `انرژی ${faNumber(report.energy)} از ۵ · وزن ${report.weight.toLocaleString('fa-IR')} کیلوگرم` })),
    ...student.workoutLogs.map(log => ({ id: log.id, student, date: log.date, title: 'تمرین ثبت‌شده', body: `${log.workoutTitle} · ${faNumber(log.results.filter(result => result.completed).length)} حرکت انجام شد` })),
    ...student.timeline.filter(item => item.type === 'message' && item.fromStudent).map(item => ({ id: item.id, student, date: item.date, title: 'پیام جدید شاگرد', body: item.body })),
  ]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
