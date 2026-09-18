export function occurrenceKey(occurrence) {
  return `${occurrence.courseAttemptId}:${occurrence.classScheduleId}:${occurrence.date}`;
}

export function findOccurrenceAbsence(absences, occurrence) {
  if (!Array.isArray(absences)) return undefined;
  const key = occurrenceKey(occurrence);
  return absences.find(
    (absence) =>
      occurrenceKey({
        courseAttemptId: absence.studentCourseAttemptId,
        classScheduleId: absence.classScheduleId,
        date: absence.date,
      }) === key
  );
}

export function occurrenceFromMeeting(attempt, meeting, date) {
  return {
    courseAttemptId: attempt.id,
    classScheduleId: meeting.id,
    date,
    courseCode: attempt.course?.code || meeting.courseCode,
    courseName: attempt.course?.name || meeting.courseCode,
    classCode: meeting.classCode,
    start: meeting.start,
    end: meeting.end,
    roomCode: meeting.roomCode,
  };
}
