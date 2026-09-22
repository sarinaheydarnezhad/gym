import { AlertCircle, Moon, Sun } from 'lucide-react'
import { Header } from '../../components/common/CoachHeader'
import { faNumber } from '../../lib/numbers'

export function SettingsPage({ dark, toggleDark, studentCount }: { dark: boolean; toggleDark: () => void; studentCount: number }) {
  return <>
    <Header title="تنظیمات" eyebrow="حساب و فضای کار" />
    <main className="page settings-page">
      <section className="panel settings-card theme-setting">
        <div className="theme-preview" aria-hidden="true"><i/><i/><i/></div>
        <div><h2>حالت محیط باشگاه</h2><p>پس‌زمینه ذغالی مات، نوشته‌های پرکنتراست و رنگ کهربایی برای استفاده حرفه‌ای در محیط کم‌نور.</p></div>
        <button className={`theme-button ${dark ? 'active' : ''}`} onClick={toggleDark}>{dark ? <Sun/> : <Moon/>}<span>{dark ? 'فعال؛ تغییر به روشن' : 'فعال‌کردن حالت تاریک'}</span></button>
      </section>
      <section className="panel settings-card coach-subscription"><div className="subscription-heading"><div><small>مدیریت اشتراک مربی</small><h2>پلن‌های ثابت شاگردیتو</h2><p>هزینه ماهانه بر اساس تعداد شاگردهای فعال است؛ بدون کمیسیون.</p></div><span className="current-plan">{faNumber(studentCount)} شاگرد فعال</span></div><div className="subscription-options">{([{ limit: 20, title: 'تا ۲۰ شاگرد', price: '۲۹۰٬۰۰۰' }, { limit: 50, title: 'تا ۵۰ شاگرد', price: '۴۹۰٬۰۰۰' }, { limit: Infinity, title: 'بیش از ۵۰ شاگرد', price: '۶۹۰٬۰۰۰' }] as const).map((tier, index) => <article key={tier.title} className={(index === 0 ? studentCount <= 20 : index === 1 ? studentCount > 20 && studentCount <= 50 : studentCount > 50) ? 'recommended' : ''}><strong>{tier.title}</strong><b>{tier.price} <small>تومان / ماه</small></b><p>اشتراک ثابت ماهانه</p></article>)}</div></section>
      <section className="panel settings-card"><h2>تنظیم تحلیل و هشدار</h2><p>آستانه‌های نسخه آزمایشی برای پایلوت مربی تنظیم شده‌اند.</p><div className="setting-row"><div><strong>هشدار پایبندی پایین</strong><span>وقتی کمتر از ۵۰٪ تمرین‌های ۱۴ روز اخیر انجام شده باشد</span></div><button className="toggle on"><i /></button></div><div className="setting-row"><div><strong>هشدار عدم فعالیت</strong><span>پس از ۱۴ روز بدون تمرین یا گزارش هفتگی</span></div><button className="toggle on"><i /></button></div><div className="setting-row"><div><strong>هشدار افت عملکرد</strong><span>با کاهش وزنه یا تکرار در ثبت‌های متوالی</span></div><button className="toggle on"><i /></button></div></section>
      <section className="panel settings-card"><h2>حریم خصوصی</h2><p>این نسخه داده‌ها را فقط روی همین مرورگر نگه می‌دارد.</p><div className="privacy-banner"><AlertCircle/><span><strong>نسخه پایلوت محلی</strong> پیش از استفاده واقعی باید احراز هویت، رمزنگاری، رضایت شاگرد و حذف داده سمت سرور پیاده‌سازی شود.</span></div></section>
    </main>
  </>
}
