import { useEffect, useState } from 'react'
import { Activity, AlertCircle, ArrowLeft, Bot, CalendarDays, Check, CircleUserRound, ClipboardCheck, Clock3, Dumbbell, FileText, MessageCircle, Send, Sparkles, Target, Weight, X, Share2, Copy, CreditCard, Moon, WalletCards } from 'lucide-react'
import { Avatar } from '../../components/common/Avatar'
import { StatusPill } from '../../components/common/StatusPill'
import { ProgramPanel } from '../../features/program/ProgramEditor'
import { ProgressPanel } from '../../features/progress/ProgressPanel'
import { CheckInHistory } from '../../features/checkins/CheckInHistory'
import { PaymentForm } from '../../features/payments/PaymentForm'
import type { Student, TimelineItem, ProfileTab } from '../../types'
import { analyzeStudent, answerStudentQuestion, calculateAdherence } from '../../analysis'
import { dayDiff, faDate, relativeDate } from '../../lib/dates'
import { faNumber } from '../../lib/numbers'
import { normalizeIranianPhone, studentShareUrl } from '../../services/sharing/links'
import type { StudentActions } from '../../services/students/studentActions'

export function ProfilePage({ student, actions, goBack, initialTab = 'overview' }: { student: Student; actions: StudentActions; goBack: () => void; initialTab?: ProfileTab }) {
  const analysis = analyzeStudent(student)
  const latest = student.checkIns[0]
  const [tab, setTab] = useState<ProfileTab>(initialTab)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([])
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [shared, setShared] = useState(false)
  const [checkinShared, setCheckinShared] = useState(false)
  useEffect(() => setTab(initialTab), [initialTab, student.id])

  const shareProgram = async () => {
    const url = studentShareUrl(student.id)
    try {
      if (navigator.share) await navigator.share({ title: `برنامه تمرینی ${student.name}`, text: `برنامه‌ات در شاگردیتو آماده است`, url })
      else await navigator.clipboard.writeText(url)
      setShared(true)
      window.setTimeout(() => setShared(false), 2600)
    } catch { /* کاربر پنجره اشتراک‌گذاری را بسته است */ }
  }
  const shareCheckin = async () => {
    const url = studentShareUrl(student.id, 'checkin')
    try {
      if (navigator.share) await navigator.share({ title: `چک‌این هفتگی ${student.name}`, url })
      else await navigator.clipboard.writeText(url)
      setCheckinShared(true)
      window.setTimeout(() => setCheckinShared(false), 2600)
    } catch { /* پنجره اشتراک‌گذاری بسته شد */ }
  }

  const ask = (value?: string) => {
    const q = value || question
    if (!q.trim()) return
    setMessages(prev => [...prev, { q, a: answerStudentQuestion(student, q) }]); setQuestion(''); setTab('assistant')
  }
  const saveNote = () => {
    if (!note.trim()) return
    actions.addCoachNote(student.id, note); setNote(''); setShowNote(false)
  }
  const markContact = () => {
    actions.recordFollowUp(student.id, 'profile')
  }
  const riskLabel = analysis.status === 'attention' ? 'ریسک بالا' : analysis.status === 'watch' ? 'ریسک متوسط' : 'ریسک پایین'
  return <><header className="profile-header"><button className="back-button" onClick={goBack}><ArrowLeft size={18} /> بازگشت</button><div className="profile-actions"><button className={`button share-program ${shared ? 'done' : ''}`} onClick={shareProgram}>{shared ? <Check size={17}/> : <Share2 size={17}/>} {shared ? 'لینک آماده شد' : 'اشتراک‌گذاری برنامه'}</button><button className="button secondary" onClick={() => setShowNote(true)}><FileText size={17} /> یادداشت جدید</button><button className="button primary" onClick={markContact}><Check size={17} /> ثبت پیگیری</button></div></header><main className="page profile-page">
    <section className="profile-identity"><Avatar student={student} size="lg" /><div><div className="name-line"><h1>{student.name}</h1><StatusPill analysis={analysis} /></div><p>{student.goal} · {student.plan}</p><div className="identity-meta"><span><CircleUserRound /> عضو از {faDate(student.joinedAt)}</span><span><MessageCircle /> آخرین ارتباط {relativeDate(student.lastContact)}</span></div></div><div className={`attention-score ${analysis.status}`}><strong>{faNumber(analysis.score)}٪</strong><span>{riskLabel}</span></div></section>
    <div className="quick-messengers"><button onClick={() => window.open(`https://wa.me/${normalizeIranianPhone(student.phone)}?text=${encodeURIComponent('سلام! گزارش هفتگی یادت نره 🌱')}`, '_blank')}><MessageCircle size={16}/> واتساپ</button><button onClick={() => navigator.clipboard.writeText('سلام! گزارش هفتگی یادت نره 🌱')}><Copy size={16}/> کپی یادآور</button><button onClick={shareCheckin}>{checkinShared ? <Check size={16}/> : <Share2 size={16}/>} {checkinShared ? 'لینک آماده شد' : 'لینک اختصاصی چک‌این'}</button></div><div className="profile-tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>نمای کلی</button><button className={tab === 'program' ? 'active' : ''} onClick={() => setTab('program')}>برنامه تمرینی</button><button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>پیشرفت</button><button className={tab === 'checkins' ? 'active' : ''} onClick={() => setTab('checkins')}>گزارش‌های هفتگی</button><button className={tab === 'finance' ? 'active' : ''} onClick={() => setTab('finance')}><CreditCard size={15}/> امور مالی</button></div><button className="assistant-fab" onClick={() => setTab('assistant')} aria-label="باز کردن دستیار مربی"><Bot size={20} /></button>

    <p className="share-limit-note">لینک‌های اختصاصی در این نسخه فقط با داده‌های همین مرورگر کار می‌کنند؛ همگام‌سازی بین دستگاه‌ها هنوز فعال نیست.</p>
    {tab === 'overview' && <div className="profile-grid"><div className="profile-main">
      <section className="panel"><div className="panel-heading"><div><h3>آخرین وضعیت</h3><p>{latest ? `ثبت‌شده در ${faDate(latest.date)}` : 'هنوز گزارش هفتگی ثبت نشده'}</p></div></div><div className="metric-cards"><div><Weight/><span>وزن</span><b>{latest ? latest.weight.toLocaleString('fa-IR') : '—'} <small>کیلوگرم</small></b></div><div><Activity/><span>پایبندی</span><b>{faNumber(calculateAdherence(student).percent)}٪</b></div><div><Dumbbell/><span>تمرین‌های این هفته</span><b>{faNumber(student.workoutLogs.filter(log => dayDiff(log.date) <= 7).length)} / {faNumber(student.program.days.length)}</b></div><div><Clock3/><span>خواب</span><b>{latest?.sleepHours ? latest.sleepHours.toLocaleString('fa-IR') : latest ? `${faNumber(latest.sleep)} / ۵` : '—'} <small>{latest?.sleepHours ? 'ساعت' : 'کیفیت'}</small></b></div></div></section>
      <section className="panel profile-timeline"><div className="panel-heading"><div><h3>خط زمانی</h3><p>آخرین اتفاق‌های شاگرد</p></div><CalendarDays size={19}/></div><div className="timeline">{[...student.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(item => <div className={`timeline-item ${item.important ? 'important' : ''}`} key={item.id}><div className="timeline-dot">{item.type === 'checkin' ? <ClipboardCheck/> : item.type === 'workout' ? <Dumbbell/> : item.type === 'message' ? <MessageCircle/> : <FileText/>}</div><div><time>{faDate(item.date)}</time><h3>{item.title}</h3><p>{item.body}</p></div></div>)}{!student.timeline.length && <p className="timeline-empty">هنوز رویدادی ثبت نشده است.</p>}</div></section>
      <section className={`insight-panel ${analysis.status}`}><div className="insight-heading"><div className="insight-icon"><Sparkles /></div><div><small>جمع‌بندی شاگردیتو</small><h2>خلاصه هوشمند و اقدام بعدی</h2></div></div><div className="insight-signals">{analysis.signals.length ? [...analysis.signals].sort((a, b) => b.points - a.points).slice(0, 4).map(signal => <div key={signal.id}><i className={signal.tone}>{signal.id === 'sleep' ? <Moon/> : signal.id === 'energy' ? <Activity/> : signal.id === 'completion' ? <Weight/> : signal.id === 'adherence' ? <Dumbbell/> : <AlertCircle/>}</i><span><strong>{signal.label}</strong><small>{signal.detail}</small></span></div>) : <p>در اطلاعات اخیر نشانه نگران‌کننده‌ای دیده نشد.</p>}</div><div className="suggested-action"><Target size={19} /><div><small>بهترین اقدام بعدی</small><p>{analysis.signals.some(signal => signal.id === 'pain') ? 'پیش از نوشتن برنامه بعدی، وضعیت درد و میزان پایبندی شاگرد را بررسی کنید.' : analysis.action}</p></div><button onClick={() => setTab('checkins')}>باز کردن چک‌این</button></div></section>
    </div><aside className="profile-side"><section className="panel quick-ask"><div className="bot-badge"><Bot /></div><h3>از دستیار مربی بپرس</h3><p>درباره روند، یادداشت‌ها یا وضعیت این شاگرد سؤال کن.</p><div className="ask-field"><input aria-label="سؤال از دستیار مربی" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="مثلاً: آخرین بار کی درد داشت؟" /><button onClick={() => ask()} aria-label="ارسال سؤال"><Send /></button></div><div className="suggestions"><button onClick={() => ask('چرا بهتره امروز پیگیری شود؟')}>چرا امروز پیگیری شود؟</button><button onClick={() => ask('روند وزنش چطور بوده؟')}>روند وزن چطور بوده؟</button><button onClick={() => ask('آیا سابقه درد دارد؟')}>سابقه درد دارد؟</button></div></section><section className="panel contact-card"><h3>اطلاعات شاگرد</h3><dl><div><dt>شماره تماس</dt><dd>{student.phone}</dd></div><div><dt>هدف</dt><dd>{student.goal}</dd></div><div><dt>نوع همکاری</dt><dd>{student.plan}</dd></div></dl></section></aside></div>}

    {tab === 'timeline' && <section className="timeline-layout"><div className="timeline panel">{student.timeline.map(item => <div className={`timeline-item ${item.important ? 'important' : ''}`} key={item.id}><div className="timeline-dot">{item.type === 'checkin' ? <ClipboardCheck /> : item.type === 'message' ? <MessageCircle /> : item.type === 'workout' ? <Dumbbell /> : <FileText />}</div><div><time>{faDate(item.date)} · {relativeDate(item.date)}</time><h3>{item.title}</h3><p>{item.body}</p></div></div>)}</div></section>}
    {tab === 'program' && <ProgramPanel student={student} actions={actions} />}
    {tab === 'progress' && <ProgressPanel student={student} />}
    {tab === 'checkins' && <CheckInHistory student={student} />}
    {tab === 'finance' && <section className="finance-grid"><article className={`panel billing-status ${student.sessionsAttended >= student.sessionsPlanned ? 'expired' : ''}`}><div className="billing-icon"><WalletCards/></div><div><small>وضعیت اشتراک</small><h2>{student.sessionsAttended >= student.sessionsPlanned ? 'نیازمند تمدید' : 'اشتراک فعال'}</h2><p>{faNumber(Math.max(0, student.sessionsPlanned - student.sessionsAttended))} جلسه از پکیج باقی مانده است.</p></div><button className="button primary" onClick={() => navigator.clipboard.writeText(`سلام ${student.name} عزیز، موعد تمدید اشتراکت رسیده. برای ادامه برنامه پیام بده 🌱`)}><Copy size={16}/> کپی پیام تمدید</button></article><PaymentForm student={student} actions={actions}/></section>}
    {tab === 'assistant' && <section className="assistant-view panel"><div className="assistant-intro"><div className="bot-badge"><Sparkles /></div><div><h2>درباره {student.name} بپرسید</h2><p>پاسخ‌ها بر اساس گزارش‌های هفتگی، اندازه‌گیری‌ها و یادداشت‌های ثبت‌شده‌اند.</p></div></div><div className="chat-area">{messages.length === 0 && <div className="chat-prompts"><button onClick={() => ask('چرا بهتره امروز پیگیری شود؟')}>چرا امروز پیگیری شود؟</button><button onClick={() => ask('آخرین وضعیت خواب و انرژی چطور بوده؟')}>وضعیت خواب و انرژی؟</button><button onClick={() => ask('آخرین بار کی با او تماس داشتم؟')}>آخرین ارتباط چه زمانی بود؟</button></div>}{messages.map((message, index) => <div className="chat-pair" key={index}><p className="coach-message">{message.q}</p><div className="bot-message"><Sparkles size={17} /><p>{message.a}</p></div></div>)}</div><div className="chat-input"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="سؤال خود را بنویسید..." /><button onClick={() => ask()}><Send /></button></div><small className="ai-note">این جمع‌بندی ممکن است خطا داشته باشد؛ تصمیم نهایی با مربی است.</small></section>}
  </main>{showNote && <div className="modal-layer"><div className="modal small" role="dialog" aria-modal="true" aria-labelledby="new-note-title"><button className="modal-close" onClick={() => setShowNote(false)} aria-label="بستن پنجره یادداشت"><X /></button><h2 id="new-note-title">یادداشت جدید</h2><p>این یادداشت در حافظه و خط زمانی شاگرد باقی می‌ماند.</p><textarea aria-label="متن یادداشت" autoFocus value={note} onChange={e => setNote(e.target.value)} placeholder="مثلاً: امروز هنگام اسکوات از درد زانوی راست گفت..." rows={5} /><button className="button primary full" onClick={saveNote}>ذخیره یادداشت</button></div></div>}</>
}
