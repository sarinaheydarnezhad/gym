import type { Student } from '../../types'
import { dayDiff } from '../../lib/dates'
import { analyzeStudent } from '../../domain/attention/attention.service'

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
