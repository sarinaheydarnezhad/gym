import { Menu, Bell, UserRound } from 'lucide-react'
import { fullDate } from '../../lib/dates'
import { useCoachMenu } from '../navigation/CoachMenuContext'

export function Header({ title, eyebrow, onMenu }: { title: string; eyebrow?: string; onMenu?: () => void }) {
  const openMenu = useCoachMenu()
  return <header className="topbar">
    <div className="header-copy"><button className="menu-button" onClick={onMenu ?? openMenu} aria-label="باز کردن منو"><Menu /></button><div>{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1></div></div>
    <div className="header-actions"><button className="icon-button" aria-label="اعلان‌ها"><Bell size={20} /><i /></button><span className="today-date">{fullDate()}</span><div className="coach-photo" aria-label="مهدی حسینی"><UserRound size={20}/></div></div>
  </header>
}
