import { type CSSProperties } from 'react'
import { Activity } from 'lucide-react'
import type { CheckIn } from '../../types'
import { faNumber } from '../../lib/numbers'

export function HealthRings({ checkIn }: { checkIn?: CheckIn }) {
  const sleep = (checkIn?.sleep ?? 0) / 5 * 360
  const energy = (checkIn?.energy ?? 0) / 5 * 360
  const nutrition = (checkIn?.nutrition ?? 0) / 5 * 360
  return <section className="panel health-card"><div className="health-rings" style={{ '--sleep': `${sleep}deg`, '--energy': `${energy}deg`, '--nutrition': `${nutrition}deg` } as CSSProperties}><i className="ring ring-sleep"/><i className="ring ring-energy"/><i className="ring ring-nutrition"/><Activity/></div><div className="health-copy"><small>وضعیت امروز</small><h3>حلقه‌های سلامت</h3><p>خواب، انرژی و تغذیه بر اساس آخرین گزارش شاگرد</p><div className="health-legend"><span><i className="turquoise"/>خواب {faNumber(checkIn?.sleep ?? 0)}/۵</span><span><i className="mustard"/>انرژی {faNumber(checkIn?.energy ?? 0)}/۵</span><span><i className="emerald"/>تغذیه {faNumber(checkIn?.nutrition ?? 0)}/۵</span></div></div></section>
}
