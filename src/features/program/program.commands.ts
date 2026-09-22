import type { ExercisePrescription, Student, WorkoutDay } from '../../types'

export function updateProgram(student: Student, program: Student['program'], now: string): Student {
  return { ...student, program: { ...program, updatedAt: now } }
}

export function updateProgramExercise(student: Student, dayId: string, exerciseId: string, field: keyof ExercisePrescription, value: string | number, now: string): Student {
  return updateProgram(student, { ...student.program, days: student.program.days.map(day => day.id !== dayId ? day : { ...day, exercises: day.exercises.map(exercise => exercise.id !== exerciseId ? exercise : { ...exercise, [field]: value }) }) }, now)
}

export function addProgramDay(student: Student, day: WorkoutDay, now: string): Student {
  return updateProgram(student, { ...student.program, days: [...student.program.days, day] }, now)
}

export function addProgramExercise(student: Student, dayId: string, exercise: ExercisePrescription, now: string): Student {
  return updateProgram(student, { ...student.program, days: student.program.days.map(day => day.id === dayId ? { ...day, exercises: [...day.exercises, exercise] } : day) }, now)
}

export function removeProgramExercise(student: Student, dayId: string, exerciseId: string, now: string): Student {
  return updateProgram(student, { ...student.program, days: student.program.days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.filter(exercise => exercise.id !== exerciseId) } : day) }, now)
}

export function renameProgramDay(student: Student, dayId: string, title: string, now: string): Student {
  return updateProgram(student, { ...student.program, days: student.program.days.map(day => day.id === dayId ? { ...day, title } : day) }, now)
}

export function removeProgramDay(student: Student, dayId: string, now: string): Student {
  return updateProgram(student, { ...student.program, days: student.program.days.filter(day => day.id !== dayId) }, now)
}
