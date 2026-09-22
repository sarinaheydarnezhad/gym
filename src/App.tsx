import { useEffect, useMemo, useState } from 'react'
import { analyzeStudent } from './analysis'
import { THEME_STORAGE_KEY } from './services/storage/keys'
import { useStudents } from './features/students/useStudents'
import { CoachLayout } from './layouts/CoachLayout'
import { Dashboard } from './features/dashboard/DashboardPage'
import { StudentsPage } from './features/students/StudentsPage'
import { InboxPage } from './features/inbox/InboxPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { LoginPage } from './features/auth/LoginPage'
import { AdminPanel } from './features/admin/AdminPage'
import { AddStudentModal } from './features/students/AddStudentModal'
import { ProfilePage } from './features/student-profile/StudentProfilePage'
import { ClientApp } from './features/student-portal/StudentPortal'
import { seedStudents } from './data'
import type { Page, ProfileTab, UserRole } from './types'
import { navigateTo, readRoute } from './app/routes'




























export default function App() {
  const { students, actions } = useStudents()
  const [route, setRoute] = useState(() => readRoute())
  const [role, setRole] = useState<UserRole | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [profileInitialTab, setProfileInitialTab] = useState<ProfileTab>('overview')
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) === 'dark')
  useEffect(() => { localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { const onPopState = () => setRoute(readRoute()); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  const page = route.page
  const selected = useMemo(() => students.find(s => s.id === route.studentId), [students, route.studentId])
  const openStudent = (id: string) => { setProfileInitialTab('overview'); navigateTo('profile', id) }
  const navigate = (next: Page) => navigateTo(next)
  const actionCount = students.filter(student => analyzeStudent(student).status !== 'stable').length
  const logout = () => { setRole(null); navigateTo('dashboard') }
  const linkParams = new URLSearchParams(window.location.search)
  const portalPath = window.location.pathname.match(/\/student\/([^/]+)$/)
  const linkedId = linkParams.get('student') || linkParams.get('program') || (portalPath ? decodeURIComponent(portalPath[1]) : null)
  const linkedStudent = linkedId ? students.find(student => student.id === linkedId) : undefined
  if (linkedId) return linkedStudent ? <ClientApp student={linkedStudent} actions={actions}/> : <main className="client-link-error"><h1>لینک شاگرد پیدا نشد</h1><p>این نسخه آزمایشی داده‌ها را فقط در مرورگری که پروفایل در آن ساخته شده نگه می‌دارد. برای اشتراک‌گذاری واقعی بین دستگاه‌ها به سرور نیاز است.</p></main>
  if (!role) return <LoginPage onLogin={setRole}/>
  if (route.invalid) return <main className="page"><div className="empty-state"><h3>صفحه پیدا نشد</h3><p>آدرس واردشده در این نسخه وجود ندارد.</p></div></main>
  if (role === 'admin') return <AdminPanel students={students} logout={logout}/>
  return <CoachLayout page={page} navigate={navigate} logout={logout} actionCount={actionCount} dark={dark} toggleDark={() => setDark(value => !value)} addStudent={() => setShowAdd(true)} openProgram={() => { setProfileInitialTab('program'); navigateTo('profile', route.studentId || seedStudents[0].id) }}>
    {page === 'dashboard' && <Dashboard students={students} openStudent={openStudent} navigate={navigate} actions={actions} />}
    {page === 'students' && <StudentsPage students={students} openStudent={openStudent} addStudent={() => setShowAdd(true)} />}
    {page === 'inbox' && <InboxPage students={students} openStudent={openStudent} />}
    {page === 'settings' && <SettingsPage dark={dark} toggleDark={() => setDark(value => !value)} studentCount={students.length} />}
    {page === 'profile' && selected && <ProfilePage student={selected} actions={actions} initialTab={profileInitialTab} goBack={() => navigate('students')} />}
    {page === 'profile' && !selected && <main className="page"><div className="empty-state"><h3>شاگرد پیدا نشد</h3><p>شناسه شاگرد در این مرورگر وجود ندارد.</p></div></main>}
    {showAdd && <AddStudentModal close={() => setShowAdd(false)} add={student => { actions.addStudent(student); setShowAdd(false); openStudent(student.id) }} />}
  </CoachLayout>
}
