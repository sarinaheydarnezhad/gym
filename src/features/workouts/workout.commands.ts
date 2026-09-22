import type { ExerciseResult, Student, WorkoutDay, WorkoutLog } from '../../types'

export function recordWorkout(student: Student, day: WorkoutDay, results: ExerciseResult[], feedback: string, now: string, logId: string, timelineId: string): Student {
  const completedCount = results.filter(result => result.completed).length
  const log: WorkoutLog = { id: logId, workoutDayId: day.id, workoutTitle: day.title, date: now, completed: completedCount === day.exercises.length, results, feedback }
  return {
    ...student,
    workoutLogs: [log, ...student.workoutLogs],
    sessionsAttended: student.sessionsAttended + 1,
    timeline: [{ id: timelineId, date: now, type: 'workout', title: `${day.title} ثبت شد`, body: `${completedCount} حرکت از ${day.exercises.length} · احساس: ${feedback}` }, ...student.timeline],
  }
}
