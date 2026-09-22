import { Activity, LayoutDashboard, Users, MessageCircle, X, Settings, LogOut } from 'lucide-react'
import { faNumber } from '../../lib/numbers'
import type { Page } from '../../types'

export function Sidebar({ page, onNavigate, open, close, logout, actionCount }: { page: Page; onNavigate: (page: Page) => void; open: boolean; close: () => void; logout: () => void; actionCount: number }) {
  const nav = [
    { id: 'dashboard' as Page, label: 'امروز', icon: <LayoutDashboard size={19} /> },
    { id: 'students' as Page, label: 'شاگردها', icon: <Users size={19} /> },
    { id: 'inbox' as Page, label: 'پیام‌های شاگردها', icon: <MessageCircle size={19} /> },
  ]
  return <>
    {open && <button className="sidebar-backdrop" onClick={close} aria-label="بستن منو" />}
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <button className="mobile-close" onClick={close} aria-label="بستن منو"><X /></button>
      <div className="brand"><div className="brand-mark"><Activity /></div><div><strong>شاگردیتو</strong><small>فضای حرفه‌ای مربی‌ها</small></div></div>
      <nav>
        <p className="nav-label">فضای کار</p>
        {nav.map(item => <button key={item.id} className={page === item.id || (page === 'profile' && item.id === 'students') ? 'active' : ''} onClick={() => { onNavigate(item.id); close() }}>{item.icon}<span>{item.label}</span>{item.id === 'dashboard' && actionCount > 0 && <b aria-label={`${faNumber(actionCount)} شاگرد نیازمند اقدام`}>{faNumber(actionCount)}</b>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <button className={page === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}><Settings size={19} /><span>تنظیمات</span></button>
        <div className="coach-card"><div className="coach-avatar">م‌ح</div><div><strong>مهدی حسینی</strong><small>مربی شخصی</small></div><button className="logout-mini" onClick={logout} aria-label="خروج از حساب"><LogOut size={17}/></button></div>
      </div>
    </aside>
  </>
}
