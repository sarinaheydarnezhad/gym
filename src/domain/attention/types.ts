export type StudentStatus = 'attention' | 'watch' | 'stable'

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
