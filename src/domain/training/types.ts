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
  coachName?: string
  sentAt?: string
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
  feedback?: string
}
