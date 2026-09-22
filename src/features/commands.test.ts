import { describe, expect, it } from 'vitest'
import { seedStudents } from '../data'
import { updateProgramExercise, addProgramDay } from './program/program.commands'
import { recordWorkout } from './workouts/workout.commands'
import { recordStudentCheckIn } from './checkins/checkin.commands'
import { recordPayment } from './payments/payment.commands'
import { recordCoachFollowUp } from './student-profile/followUp.commands'
import { buildInboxItems } from './inbox/inbox.selectors'

const student = () => seedStudents.find(item => item.id === 'sara')!
const now = '2026-09-21T12:00:00.000Z'

describe('feature commands', () => {
  it('edits exercise prescriptions and adds a program day without mutating the input', () => {
    const before = student()
    const day = before.program.days[0]
    const updated = updateProgramExercise(before, day.id, day.exercises[0].id, 'sets', 5, now)
    expect(updated.program.days[0].exercises[0].sets).toBe(5)
    expect(before.program.days[0].exercises[0].sets).toBe(4)
    const added = addProgramDay(updated, { id: 'extra', title: 'جلسه جدید', dayIndex: 0, exercises: [] }, now)
    expect(added.program.days.at(-1)?.id).toBe('extra')
    expect(added.program.updatedAt).toBe(now)
  })

  it('records workout completion, attendance, and a timeline item together', () => {
    const before = student()
    const day = before.program.days[0]
    const results = day.exercises.map(exercise => ({ exerciseId: exercise.id, exerciseName: exercise.name, completed: true }))
    const next = recordWorkout(before, day, results, 'خوب', now, 'new-log', 'new-event')
    expect(next.workoutLogs[0].completed).toBe(true)
    expect(next.sessionsAttended).toBe(before.sessionsAttended + 1)
    expect(next.timeline[0].id).toBe('new-event')
  })

  it('records a check-in and its measurement and timeline event', () => {
    const before = student()
    const checkIn = { ...before.checkIns[0], id: 'new-checkin', date: now, weight: 70 }
    const next = recordStudentCheckIn(before, checkIn, 'new-measurement', 'new-event')
    expect(next.checkIns[0]).toBe(checkIn)
    expect(next.measurements[0].weight).toBe(70)
    expect(next.timeline[0].type).toBe('checkin')
  })

  it('records payment and coach follow-up without changing other student fields', () => {
    const before = student()
    const paid = recordPayment(before, 1500000, '2026-09-21', '۳۰ روزه', 'payment', 'payment-event')
    expect(paid.payments?.[0].amount).toBe(1500000)
    expect(paid.timeline[0].title).toBe('پرداخت ثبت شد')
    const followed = recordCoachFollowUp(paid, now, 'follow-up', 'dashboard')
    expect(followed.lastContact).toBe(now)
    expect(followed.timeline[0].title).toBe('پیگیری از داشبورد انجام شد')
    expect(before.payments).toBeUndefined()
  })

  it('projects check-ins, workouts, and student messages into sorted inbox items', () => {
    const before = student()
    const next = { ...before, timeline: [{ id: 'message', date: now, type: 'message' as const, title: 'پیام', body: 'سلام', fromStudent: true }, ...before.timeline] }
    const items = buildInboxItems([next])
    expect(items[0].title).toBe('پیام جدید شاگرد')
    expect(items.some(item => item.title === 'تمرین ثبت‌شده')).toBe(true)
    expect(items.some(item => item.title === 'گزارش هفتگی جدید')).toBe(true)
  })
})
