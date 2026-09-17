import { describe, expect, it } from 'vitest'
import { analyzeStudent, answerStudentQuestion } from './analysis'
import { seedStudents } from './data'

describe('attention analysis', () => {
  it('prioritizes a student with poor attendance and low energy', () => {
    const sara = seedStudents.find(student => student.id === 'sara')!
    const result = analyzeStudent(sara)
    expect(result.status).toBe('attention')
    expect(result.signals.map(signal => signal.id)).toEqual(expect.arrayContaining(['attendance', 'energy', 'completion']))
  })

  it('keeps a consistently active student stable', () => {
    const reza = seedStudents.find(student => student.id === 'reza')!
    expect(analyzeStudent(reza).status).toBe('stable')
  })

  it('treats a newly reported pain as high priority', () => {
    const amir = seedStudents.find(student => student.id === 'amir')!
    const result = analyzeStudent(amir)
    expect(result.signals.some(signal => signal.id === 'pain')).toBe(true)
    expect(result.action).toContain('درد')
  })
})

describe('student memory assistant', () => {
  it('retrieves pain information from recorded history', () => {
    const amir = seedStudents.find(student => student.id === 'amir')!
    expect(answerStudentQuestion(amir, 'آیا قبلاً زانو درد داشته؟')).toContain('زانوی راست')
  })

  it('answers weight questions using check-in history', () => {
    const sara = seedStudents.find(student => student.id === 'sara')!
    expect(answerStudentQuestion(sara, 'روند وزن چطور بوده؟')).toContain('کیلوگرم')
  })
})
