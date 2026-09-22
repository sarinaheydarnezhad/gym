import { describe, expect, it, beforeEach } from 'vitest'
import { seedStudents } from '../../data'
import { STUDENTS_STORAGE_KEY } from '../storage/storageKeys'
import { localStudentRepository } from './localStudentRepository'
import { recordCoachFollowUp } from '../../features/students/student.commands'

const storage = new Map<string, string>()
;(globalThis as typeof globalThis & { localStorage: Storage }).localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => { storage.set(key, value) },
  removeItem: key => { storage.delete(key) },
  clear: () => storage.clear(),
  key: index => [...storage.keys()][index] ?? null,
  get length() { return storage.size },
} as Storage

describe('local student repository', () => {
  beforeEach(() => storage.clear())

  it('falls back to seed students when storage is absent or invalid', () => {
    expect(localStudentRepository.loadStudents()).toEqual(seedStudents)
    storage.set(STUDENTS_STORAGE_KEY, '{invalid')
    expect(localStudentRepository.loadStudents()).toEqual(seedStudents)
  })

  it('loads existing students and saves the existing serialization', () => {
    const students = seedStudents.slice(0, 1)
    localStudentRepository.saveStudents(students)
    expect(localStudentRepository.loadStudents()).toEqual(students)
    expect(storage.get(STUDENTS_STORAGE_KEY)).toBe(JSON.stringify(students))
  })

  it('supports a command result flowing through the repository boundary', () => {
    const current = localStudentRepository.loadStudents()
    const updated = current.map((student, index) => index === 0 ? recordCoachFollowUp(student, '2026-09-22T12:00:00.000Z', 'follow-up', 'profile') : student)
    localStudentRepository.saveStudents(updated)
    expect(localStudentRepository.loadStudents()[0].lastContact).toBe('2026-09-22T12:00:00.000Z')
  })
})
