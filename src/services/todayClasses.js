export const academicTimeZone = 'America/Sao_Paulo';

function dateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: academicTimeZone,
    year: 'numeric',
    month: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    year: Number(value('year')),
    month: Number(value('month')),
    weekday: value('weekday').toUpperCase(),
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
}

export function currentStudyPeriodCode(date = new Date()) {
  const { year, month } = dateParts(date);
  return `${year}s${month <= 6 ? 1 : 2}`;
}

export function currentStudyPeriod(date = new Date()) {
  const { year, month } = dateParts(date);
  return {
    year,
    yearPeriod: month <= 6 ? 'FIRST_SEMESTER' : 'SECOND_SEMESTER',
  };
}

export function currentScheduleDay(date = new Date()) {
  return dateParts(date).weekday;
}

export function academicMinutesNow(date = new Date()) {
  return dateParts(date).minutes;
}

export function academicDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: academicTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function formatAcademicDate(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: academicTimeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function scheduleMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function sortTodayMeetings(meetings) {
  return [...meetings].sort(
    (left, right) =>
      scheduleMinutes(left.start) - scheduleMinutes(right.start) ||
      scheduleMinutes(left.end) - scheduleMinutes(right.end) ||
      left.courseCode.localeCompare(right.courseCode)
  );
}

export function statusForTodayMeeting(meeting, meetings, date = new Date()) {
  const now = academicMinutesNow(date);
  const start = scheduleMinutes(meeting.start);
  const end = scheduleMinutes(meeting.end);
  if (end <= now) return 'finished';
  if (start <= now) return 'now';
  const nextStart = Math.min(
    ...meetings
      .map((item) => scheduleMinutes(item.start))
      .filter((itemStart) => itemStart > now)
  );
  return start === nextStart ? 'next' : 'later';
}

export const statusLabels = {
  finished: 'Encerrada',
  now: 'Agora',
  next: 'Próxima',
  later: 'Mais tarde',
  scheduled: 'Agendada',
};
