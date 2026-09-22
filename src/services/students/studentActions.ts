import type { CheckIn, ExercisePrescription, ExerciseResult, Student, WorkoutDay } from '../../types'

export interface StudentActions {
  addStudent(student: Student): void
  recordFollowUp(id: string, source: 'dashboard' | 'profile'): void
  addCoachNote(id: string, body: string): void
  recordCheckIn(id: string, checkIn: CheckIn): void
  recordWorkout(id: string, day: WorkoutDay, results: ExerciseResult[], feedback: string): void
  recordPayment(id: string, amount: number, date: string, packageName: string): void
  sendMessage(id: string, body: string): void
  updateProgram(id: string, program: Student['program']): void
  updateProgramExercise(id: string, dayId: string, exerciseId: string, field: keyof ExercisePrescription, value: string | number): void
  addProgramDay(id: string, day: WorkoutDay): void
  addProgramExercise(id: string, dayId: string, exercise: ExercisePrescription): void
  removeProgramExercise(id: string, dayId: string, exerciseId: string): void
  renameProgramDay(id: string, dayId: string, title: string): void
  removeProgramDay(id: string, dayId: string): void
}
