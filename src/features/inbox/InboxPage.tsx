import { useState } from 'react'
import { ChevronLeft, MessageCircle } from 'lucide-react'
import { Avatar } from '../../components/common/Avatar'
import { EmptyState } from '../../components/common/EmptyState'
import { Header } from '../../components/common/CoachHeader'
import type { Student } from '../../types'
import { faDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'
import { INBOX_READ_STORAGE_KEY } from '../../services/storage/keys'
import { buildInboxItems } from './inbox.selectors'

export function InboxPage({ students, openStudent }: { students: Student[]; openStudent: (id: string) => void }) {
  const [readIds, setReadIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(INBOX_READ_STORAGE_KEY) || '[]') as string[] } catch { return [] } })
  const items = buildInboxItems(students)
  const markRead = (id: string) => { if (readIds.includes(id)) return; const next = [...readIds, id]; setReadIds(next); localStorage.setItem(INBOX_READ_STORAGE_KEY, JSON.stringify(next)) }
  return <><Header title="پیام‌های شاگردها" eyebrow={`${faNumber(items.filter(item => !readIds.includes(item.id)).length)} مورد خوانده‌نشده`} /><main className="page inbox-page"><div className="section-title"><div><h2>صندوق پیام و گزارش‌ها</h2><p>چک‌این‌ها، یادداشت‌های شاگرد و تمرین‌های تازه</p></div></div><section className="panel inbox-list">{items.map(item => <button type="button" className={`inbox-item ${readIds.includes(item.id) ? '' : 'unread'}`} key={item.id} onClick={() => { markRead(item.id); openStudent(item.student.id) }}><Avatar student={item.student} size="sm"/><span><strong>{item.student.name} · {item.title}</strong><small>{item.body}</small></span><time>{faDate(item.date)}</time><ChevronLeft size={18}/></button>)}{!items.length && <EmptyState icon={<MessageCircle/>} title="صندوق ورودی خالی است" text="گزارش‌ها و تمرین‌های شاگردان اینجا نمایش داده می‌شوند."/>}</section></main></>
}
