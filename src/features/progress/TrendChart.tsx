import type { Student } from '../../types'
import { faDate } from '../../lib/dates'

export function TrendChart({ student }: { student: Student }) {
  const points = [...student.checkIns].reverse()
  if (!points.length) return null
  const min = Math.min(...points.map(p => p.weight)) - 1
  const max = Math.max(...points.map(p => p.weight)) + 1
  const coords = points.map((p, i) => ({ x: 10 + i * (80 / Math.max(1, points.length - 1)), y: 86 - ((p.weight - min) / Math.max(1, max - min)) * 66 }))
  const linePath = coords.reduce((path, point, index) => { if (!index) return `M ${point.x} ${point.y}`; const previous = coords[index - 1]; const middle = (previous.x + point.x) / 2; return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}` }, '')
  const firstWeight = points[0].weight
  const lastWeight = points.at(-1)!.weight
  const change = lastWeight - firstWeight
  return <div className="chart-wrap modern-chart"><div className="chart-title"><div><span>روند وزن</span><small className={`weight-change ${change <= 0 ? 'positive' : 'negative'}`}>{change === 0 ? 'بدون تغییر در دوره اخیر' : `${change < 0 ? 'کاهش' : 'افزایش'} ${Math.abs(change).toLocaleString('fa-IR')} کیلوگرم در دوره اخیر`}</small></div><b>{lastWeight.toLocaleString('fa-IR')} <small>کیلوگرم</small></b></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F59E0B" stopOpacity=".38"/><stop offset="1" stopColor="#F59E0B" stopOpacity="0"/></linearGradient></defs><g className="chart-grid"><line x1="10" y1="25" x2="90" y2="25"/><line x1="10" y1="50" x2="90" y2="50"/><line x1="10" y1="75" x2="90" y2="75"/></g><path d={`${linePath} L ${coords.at(-1)!.x} 90 L ${coords[0].x} 90 Z`} fill="url(#weightFill)"/><path className="weight-line" d={linePath}/>{coords.map((point, i) => <circle className="weight-point" key={points[i].id} cx={point.x} cy={point.y} r="2.5" vectorEffect="non-scaling-stroke"/>)}</svg><div className="chart-labels"><span>{faDate(points[0].date)}</span><span>{faDate(points.at(-1)!.date)}</span></div></div>
}
