import { ClipboardCheck } from 'lucide-react'
import type { Student } from '../../types'
import { faDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'

export function CheckInHistory({ student }: { student: Student }) {
  return <section className="checkin-history panel"><div className="panel-heading"><div><h3>تاریخچه گزارش‌های هفتگی</h3><p>تغییرات حال عمومی شاگرد در طول زمان</p></div><ClipboardCheck size={20}/></div>{student.checkIns.map(item => <div className="checkin-history-row" key={item.id}><time>{faDate(item.date)}</time><span><small>انرژی</small><b>{faNumber(item.energy)}/۵</b></span><span><small>خواب</small><b>{faNumber(item.sleep)}/۵</b></span><span><small>کیفیت تمرین</small><b>{faNumber(item.workoutCompletion)}٪</b></span><span className="checkin-note">{item.pain || item.note || 'بدون توضیح'}</span></div>)}</section>
}
