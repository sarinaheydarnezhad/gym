import { useState, type ReactNode } from 'react'
import { Dumbbell, MessageCircle, Moon, Plus, Sun, UserPlus } from 'lucide-react'
import { CoachMenuContext } from '../components/navigation/CoachMenuContext'
import { Sidebar } from '../components/navigation/CoachSidebar'
import { CoachBottomNav } from '../components/navigation/CoachBottomNav'
import type { Page } from '../types'

interface Props {
  children: ReactNode
  page: Page
  navigate: (page: Page) => void
  logout: () => void
  actionCount: number
  dark: boolean
  toggleDark: () => void
  addStudent: () => void
  openProgram: () => void
}

export function CoachLayout({ children, page, navigate, logout, actionCount, dark, toggleDark, addStudent, openProgram }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const goTo = (next: Page) => { navigate(next); setMenuOpen(false) }

  return <CoachMenuContext.Provider value={() => setMenuOpen(true)}>
    <div className={`app-shell ${dark ? 'dark-theme' : ''}`}>
      <Sidebar page={page} onNavigate={goTo} open={menuOpen} close={() => setMenuOpen(false)} logout={logout} actionCount={actionCount} />
      <div className="content-shell">{children}</div>
      <CoachBottomNav page={page} navigate={goTo} quick={() => setShowQuick(true)} />
      {showQuick && <div className="modal-layer quick-layer"><div className="quick-sheet"><div className="sheet-handle"/><h2>اقدام سریع</h2><button onClick={() => { setShowQuick(false); addStudent() }}><UserPlus/><span><b>افزودن شاگرد</b><small>ساخت پروفایل جدید</small></span></button><button onClick={() => { setShowQuick(false); openProgram() }}><Dumbbell/><span><b>ساخت برنامه</b><small>ورود مستقیم به برنامه شاگرد انتخاب‌شده</small></span></button><button onClick={() => { setShowQuick(false); goTo('inbox') }}><MessageCircle/><span><b>پیام‌های شاگردها</b><small>گزارش‌ها و تمرین‌های جدید</small></span></button><button onClick={toggleDark}>{dark ? <Sun/> : <Moon/>}<span><b>{dark ? 'حالت روشن' : 'حالت تاریک باشگاه'}</b><small>کاهش درخشش صفحه</small></span></button><button className="sheet-close" onClick={() => setShowQuick(false)}>بستن</button></div></div>}
    </div>
  </CoachMenuContext.Provider>
}
