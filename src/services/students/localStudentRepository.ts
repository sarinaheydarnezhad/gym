import { seedStudents } from '../../data'
import type { Student } from '../../types'
import { STUDENTS_STORAGE_KEY } from '../storage/storageKeys'
import type { StudentRepository } from './studentRepository'

export const localStudentRepository: StudentRepository = {
  loadStudents(): Student[] {
  try {
    const saved = localStorage.getItem(STUDENTS_STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) as Student[] : null
    return parsed?.every(student => student.program && student.workoutLogs && student.measurements) ? parsed : seedStudents
  } catch { return seedStudents }
  },

  saveStudents(students: Student[]) {
  const serialized = JSON.stringify(students)
  if (localStorage.getItem(STUDENTS_STORAGE_KEY) !== serialized) localStorage.setItem(STUDENTS_STORAGE_KEY, serialized)
  },

  subscribeToStudents(receive: (students: Student[]) => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STUDENTS_STORAGE_KEY || !event.newValue) return
    try {
      const next = JSON.parse(event.newValue) as Student[]
      if (Array.isArray(next)) receive(next)
    } catch { /* malformed external data */ }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
  },
}

export const loadStudents = () => localStudentRepository.loadStudents()
export const saveStudents = (students: Student[]) => localStudentRepository.saveStudents(students)
export const subscribeToStudents = (receive: (students: Student[]) => void) => localStudentRepository.subscribeToStudents!(receive)
