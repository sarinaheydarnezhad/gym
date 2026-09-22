import { useState, type FormEvent } from 'react'
import { CreditCard } from 'lucide-react'
import type { Student } from '../../types'
import { faDate } from '../../lib/dates'
import type { StudentActions } from '../../services/students/studentActions'

export function PaymentForm({ student, actions }: { student: Student; actions: StudentActions }) {
  const [saved, setSaved] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const amount = Number(data.get('amount'))
    if (!Number.isFinite(amount) || amount <= 0) return
    const date = String(data.get('date'))
    const packageName = String(data.get('packageName'))
    actions.recordPayment(student.id, amount, date, packageName)
    form.reset()
    setSaved(true)
  }
  return <article className="panel payment-card"><div className="panel-heading"><div><h3>ثبت پرداخت جدید</h3><p>ثبت دستی پرداخت؛ تراکنش بانکی انجام نمی‌شود</p></div><CreditCard/></div><form className="payment-fields" onSubmit={submit}><label>مبلغ (تومان)<input name="amount" type="number" inputMode="numeric" min="1" required placeholder="مثلاً ۱۵۰۰۰۰۰"/></label><label>تاریخ پرداخت<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required/></label><label>نوع پکیج<select name="packageName"><option>۳۰ روزه</option><option>۱۰ جلسه‌ای</option><option>سه ماهه</option></select></label><button className="button primary" type="submit">ثبت پرداخت</button></form>{saved && <p className="payment-confirmation" role="status">پرداخت در پرونده شاگرد ثبت شد.</p>}{!!student.payments?.length && <div className="payment-history"><strong>پرداخت‌های ثبت‌شده</strong>{student.payments.map(payment => <div key={payment.id}><span>{payment.packageName} · {faDate(payment.date)}</span><b>{payment.amount.toLocaleString('fa-IR')} تومان</b></div>)}</div>}</article>
}
