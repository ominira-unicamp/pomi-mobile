import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { TodayClassesWidget } from './TodayClassesWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withAuthRetry } from '../services/pomiSdk';
import {
  currentScheduleDay,
  currentStudyPeriodCode,
  sortTodayMeetings,
  statusForTodayMeeting,
  academicDateKey,
} from '../services/todayClasses';
import {
  findOccurrenceAbsence,
  occurrenceFromMeeting,
} from '../services/studentAbsences';

export async function fetchTodayClassesData(now = new Date()) {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    return { isLoggedIn: false, hasEnrolledCourses: false, meetings: [], periodCode: '' };
  }

  return await withAuthRetry(async (sdk) => {
    // 1. Get current student
    const me = await sdk.app.getCurrentUser({});
    const studentId = me?.studentId;
    if (!studentId) {
      return { isLoggedIn: true, hasEnrolledCourses: false, meetings: [], periodCode: '' };
    }

    // 2. Fetch enrolled course attempts using the SDK
    const attemptsResponse = await sdk.app.listStudentCourseAttempts({
      sid: studentId,
      filter: { status: 'ENROLLED' },
      pageSize: 'all',
    });

    const enrolledAttempts = Array.isArray(attemptsResponse?.data)
      ? attemptsResponse.data
      : [];

    if (enrolledAttempts.length === 0) {
      return {
        isLoggedIn: true,
        hasEnrolledCourses: false,
        meetings: [],
        periodCode: currentStudyPeriodCode(now),
      };
    }

    // 3. Find current study period
    const expectedPeriodCode = currentStudyPeriodCode(now); // e.g. "2026s2"
    const match = /^(\d{4})s([12])$/i.exec(expectedPeriodCode.trim());
    const academicYear = match ? Number(match[1]) : now.getFullYear();
    const academicYearPeriod =
      match && match[2] === '1' ? 'FIRST_SEMESTER' : 'SECOND_SEMESTER';

    let currentPeriodAttempt = enrolledAttempts.find(
      (a) =>
        a.studyPeriod !== null &&
        a.studyPeriod?.year === academicYear &&
        a.studyPeriod?.yearPeriod === academicYearPeriod
    );

    const currentPeriodId =
      currentPeriodAttempt?.studyPeriodId || enrolledAttempts[0]?.studyPeriodId;

    const periodAttempts = enrolledAttempts.filter(
      (a) => a.studyPeriodId === currentPeriodId
    );

    const currentPeriodCode = currentPeriodAttempt?.studyPeriod
      ? `${currentPeriodAttempt.studyPeriod.year}${
          currentPeriodAttempt.studyPeriod.yearPeriod === 'FIRST_SEMESTER'
            ? 's1'
            : 's2'
        }`
      : expectedPeriodCode;

    const attemptsByClass = new Map(
      periodAttempts.flatMap((attempt) =>
        attempt.classId ? [[attempt.classId, attempt]] : []
      )
    );

    const currentClassIds = new Set(
      periodAttempts.map((a) => a.classId).filter(Boolean)
    );

    if (currentClassIds.size === 0) {
      return {
        isLoggedIn: true,
        hasEnrolledCourses: false,
        meetings: [],
        periodCode: currentPeriodCode,
      };
    }

    // 4. Fetch schedules using the SDK
    let schedules = [];
    try {
      const schedulesResponse = await sdk.data.listClassSchedules({
        filter: {
          class: { id: { in: Array.from(currentClassIds) } },
        },
        pageSize: 1000,
      });
      schedules = schedulesResponse?.data || [];
      console.log("[Widget Schedules Total]", schedules.length);
    } catch (e) {
      console.warn('[Widget] Failed to list class schedules via SDK:', e);
    }

    // 5. Filter for student's classes & today's weekday
    const studentMeetings = schedules.filter((s) =>
      currentClassIds.has(s.classId)
    );
  console.log("[Widget Student Meetings]", studentMeetings.length, JSON.stringify(studentMeetings.map(s => ({ classId: s.classId, day: s.dayOfWeek, start: s.start, course: s.courseCode }))));
    const todayWeekday = currentScheduleDay(now);
    const todayMeetings = studentMeetings.filter(
      (s) => s.dayOfWeek === todayWeekday
    );
    const sortedMeetings = sortTodayMeetings(todayMeetings);

    // 6. Fetch absences for today using the SDK
    let absences = [];
    try {
      const absencesResponse = await sdk.app.listStudentAbsences({
        sid: studentId,
        pageSize: 'all',
      });
      absences = absencesResponse?.data || [];
    } catch (e) {
      console.warn('[Widget] Failed to list absences via SDK:', e);
    }

    // 7. Map meetings to display items
    const todayDate = academicDateKey(now);
    const meetings = sortedMeetings.map((meeting) => {
      const attempt = attemptsByClass.get(meeting.classId);
      const status = statusForTodayMeeting(meeting, sortedMeetings, now);
      const occurrence = attempt
        ? occurrenceFromMeeting(attempt, meeting, todayDate)
        : null;
      const absence = occurrence
        ? findOccurrenceAbsence(absences, occurrence)
        : null;
      const professors =
        attempt?.class?.professors?.map((p) => p.name).join(', ') || '';

      return {
        id: meeting.id.toString(),
        classScheduleId: meeting.id,
        courseAttemptId: attempt?.id,
        studentId,
        occurrenceDate: todayDate,
        start: meeting.start,
        end: meeting.end,
        status,
        courseCode: meeting.courseCode,
        courseName: attempt?.course?.name || '',
        classCode: meeting.classCode,
        roomCode: meeting.roomCode || 'Sala não informada',
        professors,
        absenceId: absence ? absence.id : null,
      };
    });

    return {
      isLoggedIn: true,
      hasEnrolledCourses: true,
      meetings,
      periodCode: currentPeriodCode,
    };
  });
}

export async function widgetTaskHandler(props) {
  const { widgetAction, clickAction, clickActionData, renderWidget, widgetInfo } = props;

  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    let dateOffset = 0;
    const storedOffset = await AsyncStorage.getItem('widgetDateOffset');
    if (storedOffset) {
      dateOffset = parseInt(storedOffset, 10) || 0;
    }

    if (!token) {
      renderWidget(
        <TodayClassesWidget
          isLoggedIn={false}
          hasEnrolledCourses={false}
          meetings={[]}
          periodCode=""
          date={new Date()}
          widgetInfo={widgetInfo}
        />
      );
      return;
    }

    if (widgetAction === 'WIDGET_CLICK') {
      if (clickAction === 'PREV_DAY') {
        dateOffset -= 1;
        await AsyncStorage.setItem('widgetDateOffset', dateOffset.toString());
      } else if (clickAction === 'NEXT_DAY') {
        dateOffset += 1;
        await AsyncStorage.setItem('widgetDateOffset', dateOffset.toString());
      } else if (clickAction === 'RESET_DAY') {
        dateOffset = 0;
        await AsyncStorage.setItem('widgetDateOffset', '0');
      } else if (clickAction === 'MARCAR_FALTA') {
        const { studentId, courseAttemptId, classScheduleId, date } = clickActionData;
        await withAuthRetry(async (sdk) => {
          await sdk.app.createStudentAbsences({
            sid: studentId,
            body: { courseAttemptId, classScheduleId, date },
          });
        });
      } else if (clickAction === 'DESFAZER_FALTA') {
        const { studentId, absenceId } = clickActionData;
        await withAuthRetry(async (sdk) => {
          await sdk.app.deleteStudentAbsences({
            sid: studentId,
            id: absenceId,
          });
        });
      }
    }

    const now = new Date();
    const targetDate = new Date(now.getTime() + dateOffset * 86400000);
    const data = await fetchTodayClassesData(targetDate);
    renderWidget(
      <TodayClassesWidget
        isLoggedIn={data.isLoggedIn}
        hasEnrolledCourses={data.hasEnrolledCourses}
        meetings={data.meetings}
        periodCode={data.periodCode}
        date={targetDate}
        widgetInfo={widgetInfo}
      />
    );
  } catch (error) {
    console.error('[Widget Task Handler Error]', error);
  }
}

export async function updateTodayClassesWidget() {
  try {
    await AsyncStorage.setItem('widgetDateOffset', '0');
    const now = new Date();
    const data = await fetchTodayClassesData(now);
    await requestWidgetUpdate({
      widgetName: 'TodayClassesWidget',
      renderWidget: (widgetInfo) => (
        <TodayClassesWidget
          isLoggedIn={data.isLoggedIn}
          hasEnrolledCourses={data.hasEnrolledCourses}
          meetings={data.meetings}
          periodCode={data.periodCode}
          date={now}
          widgetInfo={widgetInfo}
        />
      ),
    });
    console.log('[Widget] Updated successfully via SDK. Meetings count:', data.meetings.length);
  } catch (error) {
    console.warn('[Widget] Failed to update widget:', JSON.stringify(error?.problem || error));
  }
}
