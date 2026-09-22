import type { CheckIn, Student } from '../../types'

export function recordStudentCheckIn(student: Student, checkIn: CheckIn, measurementId: string, timelineId: string): Student {
  return {
    ...student,
    checkIns: [checkIn, ...student.checkIns],
    measurements: [{ id: measurementId, date: checkIn.date, weight: checkIn.weight }, ...student.measurements],
    timeline: [{ id: timelineId, date: checkIn.date, type: 'checkin', title: 'چک‌این هفتگی ثبت شد', body: `انرژی ${checkIn.energy} از ۵ · خواب ${checkIn.sleep} از ۵` }, ...student.timeline],
  }
}
