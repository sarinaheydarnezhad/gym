import type { Student } from '../../types'

export function Avatar({ student, size = 'md' }: { student: Student; size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`avatar avatar-${size}`} style={{ background: student.color }}>{student.initials}</div>
}
