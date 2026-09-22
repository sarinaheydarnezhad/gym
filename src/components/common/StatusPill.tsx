import type { StudentAnalysis } from '../../types'

export function StatusPill({ analysis }: { analysis: StudentAnalysis }) {
  const labels = { attention: 'بهتره امروز پیگیری بشه', watch: 'زیر نظر', stable: 'روبه‌راه' }
  return <span className={`status-pill ${analysis.status}`}><i />{labels[analysis.status]}</span>
}
