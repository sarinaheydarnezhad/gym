import { describe, expect, it } from 'vitest'
import { pathForPage, readRoute } from './routes'

describe('application routes', () => {
  it('maps coach screens and student profiles to explicit routes', () => {
    expect(readRoute({ pathname: '/', search: '' }).page).toBe('dashboard')
    expect(readRoute({ pathname: '/students', search: '' }).page).toBe('students')
    expect(readRoute({ pathname: '/students/sara', search: '' })).toEqual({ page: 'profile', studentId: 'sara' })
    expect(readRoute({ pathname: '/inbox', search: '' }).page).toBe('inbox')
    expect(readRoute({ pathname: '/settings', search: '' }).page).toBe('settings')
  })

  it('marks unknown paths invalid and preserves profile links', () => {
    expect(readRoute({ pathname: '/unknown', search: '' }).invalid).toBe(true)
    expect(pathForPage('profile', 'sara')).toBe('/students/sara')
  })
})
