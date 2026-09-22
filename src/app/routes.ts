import type { Page } from '../types'

export type AppRoute = { page: Page; studentId?: string; invalid?: boolean }

const stripBase = (pathname: string) => pathname.replace(/^\/gym(?=\/|$)/, '') || '/'

export function readRoute(location: Pick<Location, 'pathname' | 'search'> = window.location): AppRoute {
  const path = stripBase(location.pathname).replace(/\/$/, '') || '/'
  const profile = path.match(/^\/students\/([^/]+)$/)
  if (profile) return { page: 'profile', studentId: decodeURIComponent(profile[1]) }
  if (path === '/' || path === '/dashboard') return { page: 'dashboard' }
  if (path === '/students') return { page: 'students' }
  if (path === '/inbox') return { page: 'inbox' }
  if (path === '/settings') return { page: 'settings' }
  if (path === '/admin') return { page: 'dashboard' }
  return { page: 'dashboard', invalid: true }
}

export function pathForPage(page: Page, studentId?: string) {
  const base = typeof window !== 'undefined' ? window.location.pathname.match(/^\/gym(?=\/|$)/)?.[0] ?? '' : ''
  return `${base}${page === 'profile' && studentId ? `/students/${encodeURIComponent(studentId)}` : `/${page}`}`
}

export function navigateTo(page: Page, studentId?: string) {
  const path = pathForPage(page, studentId)
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
