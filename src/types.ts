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
