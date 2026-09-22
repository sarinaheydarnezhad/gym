import { useState } from 'react'
import { faNumber } from '../../lib/numbers'

export function RangeField({ name, label, low, high }: { name: string; label: string; low: string; high: string }) {
  const [value, setValue] = useState(3)
  const energyIcons = ['🪫', '😮‍💨', '🙂', '⚡', '🔥']
  const sleepIcons = ['🌑', '🌘', '🌗', '🌖', '🌕']
  const icons = name === 'sleep' ? sleepIcons : energyIcons
  return <div className={`range-field choice-field value-${value}`}><span><b>{label}</b><strong>{faNumber(value)} از ۵</strong></span><input name={name} type="hidden" value={value}/><div className="scale-options" role="radiogroup" aria-label={label}>{icons.map((icon, index) => <button type="button" role="radio" aria-label={`${label} ${faNumber(index + 1)} از ۵`} aria-checked={value === index + 1} className={value === index + 1 ? 'selected' : ''} key={icon} onClick={() => setValue(index + 1)}><i aria-hidden="true">{icon}</i><small>{faNumber(index + 1)}</small></button>)}</div><small className="range-caption"><i>{low}</i><i>{high}</i></small></div>
}
