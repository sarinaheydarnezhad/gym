import { useState } from 'react'

export function WorkoutFeedback({ submit }: { submit: (feedback: string) => void }) {
  const [feedback, setFeedback] = useState('')
  return <section className="workout-feedback client-checkin-card"><div className="client-section-title"><small>بازخورد بعد از تمرین</small><h1>تمرین چطور بود؟</h1><p>یک گزینه انتخاب کن و برای مربی بفرست.</p></div><div className="feedback-options">{[['سخت', '😮‍💨'], ['معمولی', '🙂'], ['خوب', '💪'], ['عالی', '🔥']].map(([label, icon]) => <button type="button" className={feedback === label ? 'selected' : ''} onClick={() => setFeedback(label)} key={label}><span>{icon}</span>{label}</button>)}</div><button type="button" className="client-primary" disabled={!feedback} onClick={() => submit(feedback)}>ثبت بازخورد و ارسال تمرین</button></section>
}
