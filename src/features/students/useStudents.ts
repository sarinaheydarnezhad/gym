import { useEffect, useState } from 'react'
import { recordCoachFollowUp, addCoachNote } from './student.commands'
import { recordStudentCheckIn } from '../checkins/checkin.commands'
import { recordWorkout } from '../workouts/workout.commands'
import { recordPayment } from '../payments/payment.commands'
import { createStudentMessage } from '../inbox/message.commands'
import { updateProgram, updateProgramExercise, addProgramDay, addProgramExercise, removeProgramExercise, renameProgramDay, removeProgramDay } from '../program/program.commands'
import { loadStudents, saveStudents, subscribeToStudents } from '../../services/students/localStudentRepository'
import type { StudentActions } from '../../services/students/studentActions'
import type { Student } from '../../types'

export function useStudents(): { students: Student[]; actions: StudentActions } {
  const [students, setStudents] = useState<Student[]>(loadStudents)
  useEffect(() => saveStudents(students), [students])
  useEffect(() => subscribeToStudents(next => setStudents(current => JSON.stringify(current) === JSON.stringify(next) ? current : next)), [])

  const changeStudent = (id: string, change: (student: Student) => Student) => {
    setStudents(current => current.map(student => student.id === id ? change(student) : student))
  }
  const actions: StudentActions = {
    addStudent: student => setStudents(current => [...current, student]),
    recordFollowUp: (id, source) => changeStudent(id, student => recordCoachFollowUp(student, new Date().toISOString(), crypto.randomUUID(), source)),
    addCoachNote: (id, body) => changeStudent(id, student => addCoachNote(student, body, new Date().toISOString(), crypto.randomUUID())),
    recordCheckIn: (id, checkIn) => changeStudent(id, student => recordStudentCheckIn(student, checkIn, crypto.randomUUID(), crypto.randomUUID())),
    recordWorkout: (id, day, results, feedback) => changeStudent(id, student => recordWorkout(student, day, results, feedback, new Date().toISOString(), crypto.randomUUID(), crypto.randomUUID())),
    recordPayment: (id, amount, date, packageName) => changeStudent(id, student => recordPayment(student, amount, date, packageName, crypto.randomUUID(), crypto.randomUUID())),
    sendMessage: (id, body) => changeStudent(id, student => createStudentMessage(student, body, new Date().toISOString(), crypto.randomUUID())),
    updateProgram: (id, program) => changeStudent(id, student => updateProgram(student, program, new Date().toISOString())),
    updateProgramExercise: (id, dayId, exerciseId, field, value) => changeStudent(id, student => updateProgramExercise(student, dayId, exerciseId, field, value, new Date().toISOString())),
    addProgramDay: (id, day) => changeStudent(id, student => addProgramDay(student, day, new Date().toISOString())),
    addProgramExercise: (id, dayId, exercise) => changeStudent(id, student => addProgramExercise(student, dayId, exercise, new Date().toISOString())),
    removeProgramExercise: (id, dayId, exerciseId) => changeStudent(id, student => removeProgramExercise(student, dayId, exerciseId, new Date().toISOString())),
    renameProgramDay: (id, dayId, title) => changeStudent(id, student => renameProgramDay(student, dayId, title, new Date().toISOString())),
    removeProgramDay: (id, dayId) => changeStudent(id, student => removeProgramDay(student, dayId, new Date().toISOString())),
  }
  return { students, actions }
}
