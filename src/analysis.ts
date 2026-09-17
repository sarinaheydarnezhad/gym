import type { Signal, Student, StudentAnalysis } from './types'

export const dayDiff = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))

export function calculateAdherence(student: Student, days = 14) {
  const weeks = days / 7
  const planned = Math.max(1, Math.round((student.program?.days.length || 0) * weeks))
  const completed = (student.workoutLogs || []).filter(log => log.completed && dayDiff(log.date) <= days).length
  return { planned, completed, percent: Math.min(100, Math.round(completed / planned * 100)) }
}

export function getExerciseTrend(student: Student, exerciseName = 'Hip Thrust') {
  const values = (student.workoutLogs || [])
    .flatMap(log => log.results.filter(result => result.completed && result.exerciseName === exerciseName).map(result => ({ date: log.date, weight: result.actualWeight || 0, reps: result.actualReps || 0 })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (values.length < 2) return { values, change: 0, state: 'insufficient' as const }
  const change = values.at(-1)!.weight - values[0].weight
  const recent = values.slice(-3)
  const plateau = recent.length >= 3 && Math.max(...recent.map(v => v.weight)) === Math.min(...recent.map(v => v.weight))
  return { values, change, state: change < 0 ? 'decline' as const : plateau ? 'plateau' as const : change > 0 ? 'improving' as const : 'stable' as const }
}

export function analyzeStudent(student: Student): StudentAnalysis {
  const signals: Signal[] = []
  const latest = student.checkIns[0]
  const previous = student.checkIns[1]
  const contactDays = dayDiff(student.lastContact)
  const adherence = calculateAdherence(student)
  const performance = getExerciseTrend(student)
  const lastWorkout = student.workoutLogs?.[0]?.date
  const lastActivityDays = Math.min(latest ? dayDiff(latest.date) : 999, lastWorkout ? dayDiff(lastWorkout) : 999)

  if (adherence.percent < 50) signals.push({ id: 'adherence', label: 'پایبندی پایین', detail: `در ۲ هفته اخیر فقط ${adherence.completed} مورد از ${adherence.planned} تمرین برنامه‌ریزی‌شده انجام شده`, points: 28, tone: 'danger' })
  else if (adherence.percent < 75) signals.push({ id: 'adherence', label: 'پایبندی نیازمند بررسی', detail: `در ۲ هفته اخیر ${adherence.completed} مورد از ${adherence.planned} تمرین انجام شده`, points: 16, tone: 'warning' })
  if (!latest || dayDiff(latest.date) > 14) signals.push({ id: 'checkin', label: 'گزارش هفتگی عقب افتاده', detail: latest ? `${dayDiff(latest.date)} روز از آخرین گزارش گذشته` : 'هنوز گزارشی ثبت نشده', points: 24, tone: 'danger' })

  if (latest) {
    const recentEnergy = student.checkIns.slice(0, 2)
    if (recentEnergy.length >= 2 && recentEnergy.every(item => item.energy <= 3) && recentEnergy.reduce((sum, item) => sum + item.energy, 0) / recentEnergy.length <= 2.5) signals.push({ id: 'energy', label: 'انرژی پایین', detail: `میانگین انرژی در ۲ گزارش اخیر ${recentEnergy.reduce((sum, item) => sum + item.energy, 0) / recentEnergy.length} از ۵ بوده`, points: 18, tone: 'danger' })
    if (latest.sleep <= 2) signals.push({ id: 'sleep', label: 'خواب ناکافی', detail: `کیفیت خواب ${latest.sleep} از ۵ است`, points: 14, tone: 'warning' })
    if (latest.workoutCompletion < 60) signals.push({ id: 'completion', label: 'کاهش انجام تمرین', detail: `فقط ${latest.workoutCompletion}٪ برنامه انجام شده`, points: 20, tone: 'danger' })
    if (latest.pain) signals.push({ id: 'pain', label: 'درد گزارش‌شده', detail: latest.pain, points: 30, tone: 'danger' })
    if (previous && latest.energy < previous.energy) signals.push({ id: 'trend', label: 'روند انرژی نزولی', detail: `از ${previous.energy} به ${latest.energy} رسیده`, points: 8, tone: 'info' })
  }

  if (performance.state === 'decline') signals.push({ id: 'performance', label: 'افت عملکرد', detail: `وزنه Hip Thrust نسبت به شروع روند ${Math.abs(performance.change)} کیلوگرم کاهش داشته`, points: 20, tone: 'danger' })
  else if (performance.state === 'plateau') signals.push({ id: 'plateau', label: 'توقف پیشرفت', detail: 'عملکرد Hip Thrust در ۳ ثبت متوالی بدون تغییر مانده', points: 12, tone: 'warning' })

  if (lastActivityDays >= 14) signals.push({ id: 'engagement', label: 'عدم فعالیت', detail: `${lastActivityDays} روز است تمرین یا گزارش جدیدی ثبت نشده`, points: 26, tone: 'danger' })

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
      : signals.some(s => s.id === 'adherence' || s.id === 'completion')
        ? 'مانع انجام تمرین را بپرسید و برنامه این هفته را سبک‌تر کنید.'
        : status === 'watch'
          ? 'در گزارش بعدی روند را دوباره بررسی کنید.'
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
    return `آخرین وزن ${latest.weight.toLocaleString('fa-IR')} کیلوگرم است؛ نسبت به ${student.checkIns.length.toLocaleString('fa-IR')} گزارش اخیر ${Math.abs(change).toLocaleString('fa-IR')} کیلوگرم ${change > 0 ? 'افزایش' : change < 0 ? 'کاهش' : 'بدون تغییر'} داشته است.`
  }
  if (/تماس|پیام|صحبت|پیگیری/.test(q)) return `${dayDiff(student.lastContact).toLocaleString('fa-IR')} روز از آخرین ارتباط گذشته است. ${analysis.action}`
  if (/خواب|انرژی|حال|روحیه/.test(q) && latest) return `در آخرین گزارش، انرژی ${latest.energy.toLocaleString('fa-IR')}، خواب ${latest.sleep.toLocaleString('fa-IR')} و حال عمومی ${latest.mood.toLocaleString('fa-IR')} از ۵ بوده است.`
  if (/چرا|توجه|پیگیری|وضعیت|خلاصه/.test(q)) return `${student.name} با امتیاز پیگیری ${analysis.score.toLocaleString('fa-IR')} از ۱۰۰ در وضعیت «${analysis.status === 'attention' ? 'بهتره امروز پیگیری بشه' : analysis.status === 'watch' ? 'زیر نظر' : 'روبه‌راه'}» است. دلیل اصلی: ${analysis.summary}. پیشنهاد: ${analysis.action}`
  return `بر اساس اطلاعات فعلی، ${analysis.summary}. ${analysis.action}`
}
