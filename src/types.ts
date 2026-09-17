export type StudentStatus = 'attention' | 'watch' | 'stable'

export interface CheckIn {
  id: string
  date: string
  energy: number
  sleep: number
  nutrition: number
  workoutCompletion: number
  weight: number
  mood: number
  pain?: string
  note?: string
}

export interface TimelineItem {
  id: string
  date: string
  type: 'note' | 'message' | 'measurement' | 'workout' | 'checkin'
  title: string
  body: string
  important?: boolean
}

export interface ExercisePrescription {
  id: string
  name: string
  sets: number
  reps: string
  targetWeight?: number
  note?: string
}

export interface WorkoutDay {
  id: string
  dayIndex: number
  title: string
  exercises: ExercisePrescription[]
}

export interface WeeklyProgram {
  id: string
  title: string
  weekLabel: string
  days: WorkoutDay[]
  updatedAt: string
}

export interface ExerciseResult {
  exerciseId: string
  exerciseName: string
  completed: boolean
  actualWeight?: number
  actualReps?: number
}

export interface WorkoutLog {
  id: string
  workoutDayId: string
  workoutTitle: string
  date: string
  completed: boolean
  results: ExerciseResult[]
}

export interface Measurement {
  id: string
  date: string
  weight: number
  waist?: number
  hip?: number
  chest?: number
}

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
}

export interface Signal {
  id: string
  label: string
  detail: string
  points: number
  tone: 'danger' | 'warning' | 'info'
}

export interface StudentAnalysis {
  score: number
  status: StudentStatus
  signals: Signal[]
  summary: string
  action: string
}
