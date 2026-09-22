import { useState, type FormEvent } from 'react'
import { Activity, ArrowLeft, CircleUserRound, Dumbbell, ShieldCheck, LockKeyhole } from 'lucide-react'
import type { UserRole } from '../../types'
import { AuthLayout } from '../../layouts/AuthLayout'

export function LoginPage({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [role, setRole] = useState<UserRole>('coach')
  const [showPassword, setShowPassword] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onLogin(role) }
  return <AuthLayout>
    <section className="login-story">
      <div className="login-brand"><div className="brand-mark"><Activity/></div><strong>شاگردیتو</strong></div>
      <div className="story-copy"><span>ساخته‌شده برای مربی‌های حرفه‌ای</span><h1>همه‌ی شاگردها، برنامه‌ها و پیگیری‌ها؛ یک‌جا و مرتب.</h1><p>کمتر درگیر کارهای پراکنده شو و بیشتر روی نتیجه‌ی شاگردهات تمرکز کن.</p></div>
      <div className="iranian-pattern" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="login-proof"><div><strong>+۲۴٪</strong><span>نظم بیشتر در پیگیری</span></div><div><strong>۲ دقیقه</strong><span>تا ساخت برنامه جدید</span></div></div>
    </section>
    <section className="login-panel"><form className="login-card" onSubmit={submit}>
      <div className="mobile-login-brand"><Activity/><strong>شاگردیتو</strong></div>
      <span className="welcome-chip">خوش اومدی 👋</span><h2>وارد فضای کارت شو</h2><p>نقش کاربری را انتخاب کن و ادامه بده.</p>
      <div className="role-switch" role="group" aria-label="انتخاب نقش"><button type="button" aria-pressed={role === 'coach'} className={role === 'coach' ? 'active' : ''} onClick={() => setRole('coach')}><Dumbbell size={18}/><span><b>مربی</b><small>مدیریت شاگردها</small></span></button><button type="button" aria-pressed={role === 'admin'} className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}><ShieldCheck size={18}/><span><b>مدیر سیستم</b><small>مدیریت مربی‌ها</small></span></button></div>
      <label>شماره موبایل<div className="login-input"><CircleUserRound size={19}/><input inputMode="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" required/></div></label>
      <label>رمز عبور<div className="login-input"><LockKeyhole size={19}/><input type={showPassword ? 'text' : 'password'} placeholder="حداقل ۶ کاراکتر" minLength={6} defaultValue="123456" required/><button type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? 'پنهان' : 'نمایش'}</button></div></label>
      <div className="login-help"><label><input type="checkbox" defaultChecked/> من را به خاطر بسپار</label><button type="button">رمزت یادت رفته؟</button></div>
      <button className="login-submit" type="submit">ورود به پنل {role === 'coach' ? 'مربی' : 'مدیریت'} <ArrowLeft size={19}/></button>
      <small className="demo-note">برای مشاهده نسخه نمایشی، هر شماره‌ای وارد کنید.</small>
    </form></section>
  </AuthLayout>
}
