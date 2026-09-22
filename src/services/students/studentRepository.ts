import type { Student } from '../../types'

export interface StudentRepository {
  loadStudents(): Student[]
  saveStudents(students: Student[]): void
  subscribeToStudents?(receive: (students: Student[]) => void): () => void
}
