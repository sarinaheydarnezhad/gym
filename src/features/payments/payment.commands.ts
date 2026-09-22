import type { Student } from '../../types'

export function recordPayment(student: Student, amount: number, date: string, packageName: string, paymentId: string, timelineId: string): Student {
  const payment = { id: paymentId, amount, date, packageName }
  return {
    ...student,
    payments: [payment, ...(student.payments || [])],
    timeline: [{ id: timelineId, date: new Date(`${date}T12:00:00`).toISOString(), type: 'note', title: 'پرداخت ثبت شد', body: `${amount.toLocaleString('fa-IR')} تومان · ${packageName}` }, ...student.timeline],
  }
}
