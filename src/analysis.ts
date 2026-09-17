import type { Signal, Student, StudentAnalysis } from './types'

export const dayDiff = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))

export function analyzeStudent(student: Student): StudentAnalysis {
  const signals: Signal[] = []
  const latest = student.checkIns[0]
  const previous = student.checkIns[1]
  const contactDays = dayDiff(student.lastContact)
  const attendance = student.sessionsPlanned ? student.sessionsAttended / student.sessionsPlanned : 1

  if (attendance < 0.6) signals.push({ id: 'attendance', label: 'افت حضور', detail: `فقط ${Math.round(attendance * 100)}٪ جلسات این ماه انجام شده`, points: 28, tone: 'danger' })
  else if (attendance < 0.78) signals.push({ id: 'attendance', label: 'حضور نامنظم', detail: `${Math.round(attendance * 100)}٪ جلسات این ماه انجام شده`, points: 16, tone: 'warning' })
  if (!latest || dayDiff(latest.date) > 14) signals.push({ id: 'checkin', label: 'چک‌این عقب‌افتاده', detail: latest ? `${dayDiff(latest.date)} روز از آخرین چک‌این گذشته` : 'هنوز چک‌انی ثبت نشده', points: 24, tone: 'danger' })

  if (latest) {
    if (latest.energy <= 2) signals.push({ id: 'energy', label: 'انرژی پایین', detail: `انرژی ${latest.energy} از ۵ گزارش شده`, points: 18, tone: 'danger' })
    if (latest.sleep <= 2) signals.push({ id: 'sleep', label: 'خواب ناکافی', detail: `کیفیت خواب ${latest.sleep} از ۵ است`, points: 14, tone: 'warning' })
    if (latest.workoutCompletion < 60) signals.push({ id: 'completion', label: 'کاهش انجام تمرین', detail: `فقط ${latest.workoutCompletion}٪ برنامه انجام شده`, points: 20, tone: 'danger' })
    if (latest.pain) signals.push({ id: 'pain', label: 'درد گزارش‌شده', detail: latest.pain, points: 30, tone: 'danger' })
    if (previous && latest.energy < previous.energy) signals.push({ id: 'trend', label: 'روند انرژی نزولی', detail: `از ${previous.energy} به ${latest.energy} رسیده`, points: 8, tone: 'info' })
  }

  if (contactDays >= 14) signals.push({ id: 'contact', label: 'نیاز به پیگیری', detail: `${contactDays} روز از آخرین ارتباط گذشته`, points: 18, tone: 'warning' })
  else if (contactDays >= 10) signals.push({ id: 'contact', label: 'فاصله ارتباطی', detail: `${contactDays} روز از آخرین ارتباط گذشته`, points: 10, tone: 'info' })

  const score = Math.min(100, signals.reduce((sum, signal) => sum + signal.points, 0))
  const status = score >= 45 ? 'attention' : score >= 20 ? 'watch' : 'stable'
  const top = [...signals].sort((a, b) => b.points - a.points).slice(0, 2)
  const summary = top.length ? top.map(item => item.label).join(' و ') : 'روند شاگرد پایدار است'
  const action = signals.some(s => s.id === 'pain')
    ? 'قبل از تمرین بعدی درباره درد تماس بگیرید و حرکت محرک را بررسی کنید.'
    : signals.some(s => s.id === 'contact')
      ? 'امروز یک پیام کوتاه و شخصی برای پیگیری ارسال کنید.'
      : signals.some(s => s.id === 'attendance' || s.id === 'completion')
        ? 'مانع انجام تمرین را بپرسید و برنامه این هفته را سبک‌تر کنید.'
        : status === 'watch'
          ? 'در چک‌این بعدی روند را دوباره بررسی کنید.'
          : 'اقدام فوری لازم نیست؛ روند معمول را ادامه دهید.'

  return { score, status, signals, summary, action }
}

export function answerStudentQuestion(student: Student, rawQuestion: string): string {
  const q = rawQuestion.trim()
  const analysis = analyzeStudent(student)
  const latest = student.checkIns[0]
  if (!q) return 'سؤال خود را درباره این شاگرد بنویسید.'
  if (/درد|آسیب|زانو|کمر/.test(q)) {
    const painItems = [latest?.pain, ...student.timeline.filter(t => /درد|آسیب|زانو|کمر/.test(t.body)).map(t => t.body)].filter(Boolean)
    return painItems.length ? `در سوابق ${student.name}: ${[...new Set(painItems)].join(' — ')}` : `در سوابق ثبت‌شده ${student.name} موردی از درد یا آسیب پیدا نکردم.`
  }
  if (/وزن|لاغر|چاق/.test(q)) {
    if (!latest) return 'هنوز وزن ثبت‌شده‌ای وجود ندارد.'
    const oldest = student.checkIns.at(-1)
    const change = oldest ? latest.weight - oldest.weight : 0
    return `آخرین وزن ${latest.weight.toLocaleString('fa-IR')} کیلوگرم است؛ نسبت به ${student.checkIns.length.toLocaleString('fa-IR')} چک‌این اخیر ${Math.abs(change).toLocaleString('fa-IR')} کیلوگرم ${change > 0 ? 'افزایش' : change < 0 ? 'کاهش' : 'بدون تغییر'} داشته است.`
  }
  if (/تماس|پیام|صحبت|پیگیری/.test(q)) return `${dayDiff(student.lastContact).toLocaleString('fa-IR')} روز از آخرین ارتباط گذشته است. ${analysis.action}`
  if (/خواب|انرژی|حال|روحیه/.test(q) && latest) return `در آخرین چک‌این، انرژی ${latest.energy.toLocaleString('fa-IR')}، خواب ${latest.sleep.toLocaleString('fa-IR')} و حال عمومی ${latest.mood.toLocaleString('fa-IR')} از ۵ بوده است.`
  if (/چرا|توجه|وضعیت|خلاصه/.test(q)) return `${student.name} با امتیاز توجه ${analysis.score.toLocaleString('fa-IR')} از ۱۰۰ در وضعیت «${analysis.status === 'attention' ? 'نیازمند توجه' : analysis.status === 'watch' ? 'زیر نظر' : 'پایدار'}» است. دلیل اصلی: ${analysis.summary}. پیشنهاد: ${analysis.action}`
  return `بر اساس اطلاعات فعلی، ${analysis.summary}. ${analysis.action}`
}
