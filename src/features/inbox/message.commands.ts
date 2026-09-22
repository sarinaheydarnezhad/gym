import type { Student } from '../../types'

export function createStudentMessage(student: Student, body: string, now: string, id: string): Student {
  return { ...student, timeline: [{ id, date: now, type: 'message', title: 'پیام شاگرد', body, fromStudent: true }, ...student.timeline] }
}
