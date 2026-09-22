import type { CheckIn } from '../checkins/types'
import type { PaymentRecord } from '../payments/types'
import type { TimelineItem } from '../timeline/types'
import type { Measurement } from './measurement'
import type { WeeklyProgram, WorkoutLog } from '../training/types'

export type { Measurement } from './measurement'

export interface Student {
  id: string
  name: string
  initials: string
  color: string
  phone: string
  goal: string
  plan: string
  joinedAt: string
  lastContact: string
  sessionsPlanned: number
  sessionsAttended: number
  program: WeeklyProgram
  workoutLogs: WorkoutLog[]
  measurements: Measurement[]
  checkIns: CheckIn[]
  timeline: TimelineItem[]
  payments?: PaymentRecord[]
}
