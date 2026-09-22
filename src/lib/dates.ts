import { faNumber } from './numbers'

export const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']
export const dayDiff = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))
export const faDate = (date: string) => new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(new Date(date))
export const fullDate = () => new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
export const relativeDate = (date: string) => {
  const days = dayDiff(date)
  return days === 0 ? 'امروز' : days === 1 ? 'دیروز' : `${faNumber(days)} روز پیش`
}
