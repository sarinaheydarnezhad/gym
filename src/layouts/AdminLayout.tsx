import type { ReactNode } from 'react'

export function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-shell">{children}</div>
}
