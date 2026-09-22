import { type CSSProperties } from 'react'
import { TrendingDown, Weight, Trophy } from 'lucide-react'
import type { Student } from '../../types'
import { calculateAdherence, getExerciseTrend } from '../../analysis'
import { faDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'

export function ProgressPanel({ student }: { student: Student }) {
  const adherence = calculateAdherence(student)
  const trend = getExerciseTrend(student)
  return <div className="progress-layout"><section className="panel progress-summary"><div className="adherence-ring" style={{ '--value': `${adherence.percent * 3.6}deg` } as CSSProperties}><div><strong>{faNumber(adherence.percent)}٪</strong><span>پایبندی</span></div></div><div><small>۱۴ روز اخیر</small><h2>{faNumber(adherence.completed)} از {faNumber(adherence.planned)} تمرین</h2><p>{adherence.percent >= 75 ? 'روند انجام برنامه خوب است.' : 'انجام برنامه کمتر از هدف تعیین‌شده است.'}</p></div></section><section className="panel performance-card"><div className="panel-heading"><div><h3>روند عملکرد</h3><p>Hip Thrust · ثبت‌های اخیر</p></div><Trophy size={20}/></div><div className="performance-values">{trend.values.slice(-5).map((value, index) => <div key={value.date}><span>هفته {faNumber(index + 1)}</span><b>{value.weight.toLocaleString('fa-IR')} kg × {faNumber(value.reps)}</b></div>)}</div><div className={`trend-result ${trend.state}`}><TrendingDown size={17}/><span>{trend.state === 'improving' ? `${trend.change.toLocaleString('fa-IR')} کیلوگرم پیشرفت ثبت شده` : trend.state === 'plateau' ? 'سه ثبت متوالی بدون تغییر' : trend.state === 'decline' ? 'کاهش عملکرد نیازمند بررسی است' : 'داده بیشتری برای تشخیص روند لازم است'}</span></div></section><section className="panel measurement-card"><div className="panel-heading"><div><h3>اندازه‌گیری‌ها</h3><p>آخرین تغییرات بدن</p></div><Weight size={19}/></div>{student.measurements.map(item => <div className="measurement-row" key={item.id}><time>{faDate(item.date)}</time><span><small>وزن</small><b>{item.weight.toLocaleString('fa-IR')} kg</b></span><span><small>دور کمر</small><b>{item.waist?.toLocaleString('fa-IR') || '—'} cm</b></span><span><small>دور باسن</small><b>{item.hip?.toLocaleString('fa-IR') || '—'} cm</b></span></div>)}</section></div>
}
