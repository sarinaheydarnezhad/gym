import { LayoutDashboard, Users, Plus, MessageCircle, Settings } from 'lucide-react'
import type { Page } from '../../types'

export function CoachBottomNav({ page, navigate, quick }: { page: Page; navigate: (page: Page) => void; quick: () => void }) {
  return <nav className="coach-bottom-nav"><button className={page === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}><LayoutDashboard/><span>خانه</span></button><button className={page === 'students' || page === 'profile' ? 'active' : ''} onClick={() => navigate('students')}><Users/><span>شاگردها</span></button><button className="coach-fab" onClick={quick} aria-label="اقدام سریع"><Plus/></button><button className={page === 'inbox' ? 'active' : ''} onClick={() => navigate('inbox')}><MessageCircle/><span>پیام‌ها</span></button><button className={page === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings/><span>تنظیمات</span></button></nav>
}
