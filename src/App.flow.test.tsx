// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { seedStudents } from './data'

describe('dedicated student flow', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
    Object.defineProperty(window.crypto, 'randomUUID', { configurable: true, value: () => `test-${Math.random()}` })
    window.scrollTo = vi.fn()
    localStorage.clear()
    window.history.replaceState(null, '', '/?student=sara&view=checkin')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    window.history.replaceState(null, '', '/')
    localStorage.clear()
  })

  it('opens the weekly check-in without the coach login and saves pain and notes', async () => {
    await act(async () => root.render(<App/>))
    expect(container.textContent).toContain('این هفته چطور بود؟')
    expect(container.querySelector('.login-page')).toBeNull()

    const form = container.querySelector<HTMLFormElement>('.client-checkin-card')!
    form.querySelector<HTMLInputElement>('[name="pain"]')!.value = 'زانو'
    form.querySelector<HTMLInputElement>('[name="weight"]')!.value = '68.4'
    form.querySelector<HTMLInputElement>('[name="sleepHours"]')!.value = '6.2'
    form.querySelector<HTMLTextAreaElement>('[name="note"]')!.value = 'لطفاً برنامه بعدی را سبک‌تر کنید'
    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })

    const students = JSON.parse(localStorage.getItem('hamrah-coach-students-v1') || '[]') as typeof seedStudents
    const report = students.find(student => student.id === 'sara')!.checkIns[0]
    expect(report.pain).toBe('زانو')
    expect(report.sleepHours).toBe(6.2)
    expect(report.note).toContain('سبک‌تر')
    expect(container.textContent).toContain('چک‌این برای مربی ارسال شد')
  })

  it('explains when a student link cannot find local data', async () => {
    window.history.replaceState(null, '', '/?student=unknown')
    await act(async () => root.render(<App/>))
    expect(container.textContent).toContain('برای اشتراک‌گذاری واقعی بین دستگاه‌ها به سرور نیاز است')
  })
})

describe('coach action dashboard', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
    Object.defineProperty(window.crypto, 'randomUUID', { configurable: true, value: () => `test-${Math.random()}` })
    window.scrollTo = vi.fn()
    localStorage.clear()
    window.history.replaceState(null, '', '/')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    localStorage.clear()
  })

  it('shows actionable students by default and records a quick follow-up', async () => {
    await act(async () => root.render(<App/>))
    const login = container.querySelector<HTMLFormElement>('.login-card')!
    await act(async () => { login.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })

    const priorities = container.querySelector<HTMLElement>('.attention-grid')!
    expect(priorities.textContent).toContain('سارا احمدی')
    expect(priorities.textContent).not.toContain('رضا کریمی')

    const saraCard = [...container.querySelectorAll<HTMLElement>('.priority-tile')].find(card => card.textContent?.includes('سارا احمدی'))!
    const followUp = [...saraCard.querySelectorAll<HTMLButtonElement>('.priority-actions button')].find(button => button.textContent?.includes('پیگیری شد'))!
    await act(async () => { followUp.click() })

    const students = JSON.parse(localStorage.getItem('hamrah-coach-students-v1') || '[]') as typeof seedStudents
    expect(students.find(student => student.id === 'sara')?.timeline[0].title).toBe('پیگیری از داشبورد انجام شد')
    expect(saraCard.textContent).toContain('ثبت شد')
  })
})
