import type { ReactNode } from 'react'

export function StudentLayout({ children }: { children: ReactNode }) {
  return <div className="client-shell">{children}</div>
}
