export interface CheckIn {
  id: string
  date: string
  energy: number
  sleep: number
  sleepHours?: number
  nutrition: number
  workoutCompletion: number
  weight: number
  mood: number
  pain?: string
  note?: string
}
