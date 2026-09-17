import type { Student } from './types'

const daysAgo = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const ci = (id: string, days: number, energy: number, sleep: number, nutrition: number, completion: number, weight: number, mood = energy, pain = '', note = '') => ({
  id, date: daysAgo(days), energy, sleep, nutrition, workoutCompletion: completion, weight, mood, pain, note,
})

const todayIndex = new Date().getDay()

const makeProgram = (prefix: string, focus = 'قدرت و تناسب اندام') => ({
  id: `${prefix}-program`,
  title: `برنامه ${focus}`,
  weekLabel: 'هفته جاری',
  updatedAt: daysAgo(5),
  days: [
    { id: `${prefix}-d1`, dayIndex: todayIndex, title: 'پایین‌تنه و قدرت', exercises: [
      { id: `${prefix}-e1`, name: 'Hip Thrust', sets: 4, reps: '۸', targetWeight: 80, note: 'مکث یک ثانیه بالا' },
      { id: `${prefix}-e2`, name: 'Goblet Squat', sets: 3, reps: '۱۰', targetWeight: 22 },
      { id: `${prefix}-e3`, name: 'Romanian Deadlift', sets: 3, reps: '۱۰', targetWeight: 45 },
    ] },
    { id: `${prefix}-d2`, dayIndex: (todayIndex + 2) % 7, title: 'بالاتنه', exercises: [
      { id: `${prefix}-e4`, name: 'Lat Pulldown', sets: 3, reps: '۱۲', targetWeight: 35 },
      { id: `${prefix}-e5`, name: 'Dumbbell Press', sets: 3, reps: '۱۰', targetWeight: 12 },
      { id: `${prefix}-e6`, name: 'Seated Row', sets: 3, reps: '۱۲', targetWeight: 32 },
    ] },
    { id: `${prefix}-d3`, dayIndex: (todayIndex + 4) % 7, title: 'فول‌بادی و هوازی', exercises: [
      { id: `${prefix}-e7`, name: 'Leg Press', sets: 3, reps: '۱۲', targetWeight: 90 },
      { id: `${prefix}-e8`, name: 'Shoulder Press', sets: 3, reps: '۱۰', targetWeight: 10 },
      { id: `${prefix}-e9`, name: 'Incline Walk', sets: 1, reps: '۲۰ دقیقه', note: 'شیب ۸ تا ۱۰ درصد' },
    ] },
  ],
})

const makeLogs = (prefix: string, count: number, weights: number[], startDays = 2) => Array.from({ length: count }, (_, index) => ({
  id: `${prefix}-log-${index}`,
  workoutDayId: `${prefix}-d${index % 3 + 1}`,
  workoutTitle: index % 3 === 0 ? 'پایین‌تنه و قدرت' : index % 3 === 1 ? 'بالاتنه' : 'فول‌بادی و هوازی',
  date: daysAgo(startDays + index * 3),
  completed: true,
  results: [
    { exerciseId: `${prefix}-e1`, exerciseName: 'Hip Thrust', completed: true, actualWeight: weights[index] ?? weights.at(-1) ?? 80, actualReps: 8 },
    { exerciseId: `${prefix}-e2`, exerciseName: 'Goblet Squat', completed: true, actualWeight: 22, actualReps: 10 },
  ],
}))

const makeMeasurements = (prefix: string, current: number) => [
  { id: `${prefix}-m1`, date: daysAgo(2), weight: current, waist: 82 },
  { id: `${prefix}-m2`, date: daysAgo(16), weight: current + .4, waist: 83 },
  { id: `${prefix}-m3`, date: daysAgo(30), weight: current + .8, waist: 84 },
]

export const seedStudents: Student[] = [
  {
    id: 'sara', name: 'سارا احمدی', initials: 'س‌ا', color: '#e8a87c', phone: '۰۹۱۴ ۱۲۳ ۴۵۶۷', goal: 'کاهش وزن و افزایش انرژی', plan: 'آنلاین + دو جلسه حضوری', joinedAt: daysAgo(135), lastContact: daysAgo(12), sessionsPlanned: 12, sessionsAttended: 6,
    program: makeProgram('sa', 'کاهش وزن'), workoutLogs: makeLogs('sa', 2, [80, 77.5]), measurements: makeMeasurements('sa', 72.8),
    checkIns: [ci('s1', 2, 2, 2, 3, 45, 72.8, 2, '', 'این هفته خیلی خسته بودم و دو جلسه را نرسیدم.'), ci('s2', 9, 3, 3, 3, 65, 72.4), ci('s3', 16, 4, 4, 4, 85, 72.1), ci('s4', 23, 4, 4, 4, 90, 72.3)],
    timeline: [
      { id: 'st1', date: daysAgo(2), type: 'checkin', title: 'گزارش هفتگی ثبت شد', body: 'انرژی ۲ از ۵ · انجام تمرین ۴۵٪', important: true },
      { id: 'st2', date: daysAgo(12), type: 'message', title: 'آخرین گفت‌وگو', body: 'درباره تنظیم زمان تمرین صحبت شد.' },
      { id: 'st3', date: daysAgo(28), type: 'measurement', title: 'اندازه‌گیری ماهانه', body: 'وزن ۷۲٫۶ کیلوگرم · دور کمر ۸۳ سانتی‌متر' },
    ],
  },
  {
    id: 'amir', name: 'امیر رضایی', initials: 'ا‌ر', color: '#86b8a7', phone: '۰۹۱۲ ۴۳۲ ۸۷۶۵', goal: 'افزایش حجم و قدرت', plan: 'سه جلسه حضوری', joinedAt: daysAgo(220), lastContact: daysAgo(4), sessionsPlanned: 12, sessionsAttended: 10,
    program: makeProgram('am', 'حجم و قدرت'), workoutLogs: makeLogs('am', 5, [85, 85, 82.5, 82.5, 80]), measurements: makeMeasurements('am', 81.2),
    checkIns: [ci('a1', 1, 4, 3, 4, 85, 81.2, 4, 'درد خفیف زانوی راست هنگام اسکوات', 'در حرکات دیگر مشکلی ندارم.'), ci('a2', 8, 4, 4, 4, 90, 80.8), ci('a3', 15, 4, 4, 4, 90, 80.4)],
    timeline: [
      { id: 'at1', date: daysAgo(1), type: 'checkin', title: 'درد جدید گزارش شد', body: 'درد خفیف زانوی راست هنگام اسکوات', important: true },
      { id: 'at2', date: daysAgo(4), type: 'workout', title: 'رکورد جدید ددلیفت', body: '۱۲۰ کیلوگرم · ۵ تکرار' },
      { id: 'at3', date: daysAgo(42), type: 'note', title: 'یادداشت مربی', body: 'فرم اسکوات خوب است؛ روی کنترل فاز منفی تمرکز شود.' },
    ],
  },
  {
    id: 'niloufar', name: 'نیلوفر محمدی', initials: 'ن‌م', color: '#b7a2d8', phone: '۰۹۱۴ ۸۷۶ ۱۱۲۲', goal: 'تناسب اندام', plan: 'کاملاً آنلاین', joinedAt: daysAgo(75), lastContact: daysAgo(15), sessionsPlanned: 10, sessionsAttended: 7,
    program: makeProgram('ni', 'تناسب اندام'), workoutLogs: makeLogs('ni', 4, [70, 67.5, 67.5, 65]), measurements: makeMeasurements('ni', 64.1),
    checkIns: [ci('n1', 5, 3, 3, 2, 70, 64.1, 3, '', 'رعایت تغذیه آخر هفته سخت بود.'), ci('n2', 12, 3, 4, 3, 75, 63.7), ci('n3', 19, 4, 4, 4, 85, 63.9)],
    timeline: [
      { id: 'nt1', date: daysAgo(5), type: 'checkin', title: 'گزارش هفتگی', body: 'تغذیه ۲ از ۵ · انرژی ۳ از ۵' },
      { id: 'nt2', date: daysAgo(15), type: 'message', title: 'آخرین پیگیری مربی', body: 'برنامه هفته جدید ارسال شد.' },
    ],
  },
  {
    id: 'reza', name: 'رضا کریمی', initials: 'ر‌ک', color: '#e6bf62', phone: '۰۹۱۹ ۶۵۴ ۹۹۱۱', goal: 'آمادگی مسابقه', plan: 'چهار جلسه حضوری', joinedAt: daysAgo(310), lastContact: daysAgo(1), sessionsPlanned: 16, sessionsAttended: 15,
    program: makeProgram('re', 'آمادگی مسابقه'), workoutLogs: makeLogs('re', 6, [130, 127.5, 125, 125, 122.5, 120]), measurements: makeMeasurements('re', 86.2),
    checkIns: [ci('r1', 2, 5, 4, 5, 95, 86.2, 5), ci('r2', 9, 4, 4, 5, 95, 86.5), ci('r3', 16, 4, 4, 4, 90, 86.8)],
    timeline: [
      { id: 'rt1', date: daysAgo(1), type: 'workout', title: 'تمرین پایین‌تنه کامل شد', body: 'حجم تمرین ۸٪ نسبت به هفته قبل افزایش یافت.' },
      { id: 'rt2', date: daysAgo(2), type: 'checkin', title: 'گزارش هفتگی', body: 'شرایط پایدار و بدون مشکل گزارش شد.' },
    ],
  },
  {
    id: 'maryam', name: 'مریم جعفری', initials: 'م‌ج', color: '#e7929e', phone: '۰۹۱۴ ۵۵۵ ۲۲۰۰', goal: 'بازگشت به تمرین', plan: 'دو جلسه حضوری', joinedAt: daysAgo(95), lastContact: daysAgo(7), sessionsPlanned: 8, sessionsAttended: 7,
    program: makeProgram('ma', 'بازگشت به تمرین'), workoutLogs: makeLogs('ma', 5, [50, 47.5, 47.5, 45, 45]), measurements: makeMeasurements('ma', 68.3),
    checkIns: [ci('m1', 4, 4, 4, 4, 90, 68.3, 4), ci('m2', 11, 4, 3, 4, 85, 68.5), ci('m3', 18, 3, 3, 4, 80, 68.7)],
    timeline: [
      { id: 'mt1', date: daysAgo(4), type: 'checkin', title: 'گزارش هفتگی', body: 'انرژی و خواب بهتر از هفته قبل است.' },
      { id: 'mt2', date: daysAgo(7), type: 'message', title: 'پیگیری مربی', body: 'درباره افزایش تدریجی فشار تمرین صحبت شد.' },
    ],
  },
  {
    id: 'pouya', name: 'پویا نادری', initials: 'پ‌ن', color: '#76a9d4', phone: '۰۹۱۲ ۳۳۳ ۸۱۰۰', goal: 'عضله‌سازی', plan: 'کاملاً آنلاین', joinedAt: daysAgo(55), lastContact: daysAgo(19), sessionsPlanned: 12, sessionsAttended: 5,
    program: makeProgram('po', 'عضله‌سازی'), workoutLogs: makeLogs('po', 1, [70], 20), measurements: makeMeasurements('po', 75.1),
    checkIns: [ci('p1', 17, 3, 2, 3, 40, 75.1, 3), ci('p2', 24, 3, 3, 3, 60, 74.8)],
    timeline: [
      { id: 'pt1', date: daysAgo(17), type: 'checkin', title: 'آخرین گزارش هفتگی', body: 'خواب ۲ از ۵ · انجام تمرین ۴۰٪', important: true },
      { id: 'pt2', date: daysAgo(19), type: 'message', title: 'آخرین تماس', body: 'پیام برنامه جدید خوانده شده اما پاسخی ثبت نشده است.' },
    ],
  },
]
