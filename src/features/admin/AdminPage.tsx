import { Activity, Search, UserPlus, Users, LogOut, UserCog, Building2 } from 'lucide-react'
import type { Student } from '../../types'
import { faNumber } from '../../lib/numbers'
import { AdminLayout } from '../../layouts/AdminLayout'

export function AdminPanel({ students, logout }: { students: Student[]; logout: () => void }) {
  const coaches = [
    { name: 'مهدی حسینی', specialty: 'بدنسازی و تناسب اندام', students: students.length, status: 'فعال' },
    { name: 'سارا مرادی', specialty: 'فیتنس بانوان', students: 18, status: 'فعال' },
    { name: 'علی رضوانی', specialty: 'آمادگی جسمانی', students: 11, status: 'در انتظار تأیید' },
  ]
  return <AdminLayout><header className="admin-header"><div className="login-brand"><div className="brand-mark"><Activity/></div><strong>شاگردیتو</strong><span>مدیریت</span></div><button onClick={logout}><LogOut size={18}/> خروج</button></header><main className="admin-main">
    <div className="admin-title"><div><span>پنل مدیریت</span><h1>نمای کلی کسب‌وکار</h1><p>وضعیت مربی‌ها و فضای کاری شاگردیتو را یک‌جا ببینید.</p></div><button className="button primary"><UserPlus size={18}/> افزودن مربی</button></div>
    <section className="admin-stats"><article><i><UserCog/></i><span>مربی فعال<strong>۲۴</strong><small>۳ نفر این ماه اضافه شدند</small></span></article><article><i><Users/></i><span>کل شاگردها<strong>{faNumber(students.length + 142)}</strong><small>در ۲۴ فضای کاری</small></span></article><article><i><Building2/></i><span>اشتراک‌های حرفه‌ای<strong>۱۸</strong><small>۷۵٪ نرخ تبدیل</small></span></article></section>
    <section className="panel admin-table"><div className="panel-heading"><div><h3>مربی‌های اخیر</h3><p>مدیریت دسترسی و وضعیت حساب مربی‌ها</p></div><div className="search-box"><Search size={17}/><input placeholder="جست‌وجوی مربی..."/></div></div><div className="admin-row admin-row-head"><span>مربی</span><span>تخصص</span><span>شاگردها</span><span>وضعیت</span><span/></div>{coaches.map(coach => <div className="admin-row" key={coach.name}><span className="student-cell"><div className="coach-avatar">{coach.name.split(' ').map(x => x[0]).join('‌')}</div><b>{coach.name}</b></span><span>{coach.specialty}</span><span>{faNumber(coach.students)} نفر</span><span><i className={coach.status === 'فعال' ? 'admin-active' : 'admin-pending'}>{coach.status}</i></span><button>جزئیات</button></div>)}</section>
  </main></AdminLayout>
}
