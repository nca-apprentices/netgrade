import { useState } from 'react';
import {
  format,
  isSameDay,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { Exam } from '@/db/entities/Exam';

/**
 * Custom hook to manage calendar state and operations
 */
export const useCalendar = (exams: Exam[] = []) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const upcomingExams = exams.filter((exam) => !exam.isCompleted);

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(
      direction === 'prev'
        ? subMonths(currentMonth, 1)
        : addMonths(currentMonth, 1),
    );
  };

  const eventsForSelectedDate = upcomingExams.filter((event: Exam) =>
    isSameDay(event.date, selectedDate),
  );

  const groupExamsByMonth = () => {
    const groups: Record<string, Exam[]> = {};

    upcomingExams.forEach((exam) => {
      const monthKey = format(exam.date, 'yyyy-MM');
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(exam);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, exams]) => ({
        monthKey,
        monthName: format(new Date(monthKey + '-01'), 'MMMM yyyy', {
          locale: de,
        }),
        exams: exams.sort((a, b) => a.date.getTime() - b.date.getTime()),
      }));
  };

  const generateCalendarData = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => ({
      date: day,
      isCurrentMonth: isSameMonth(day, currentMonth),
      isToday: isToday(day),
      isSelected: isSameDay(day, selectedDate),
      hasExam: upcomingExams.some((exam) => isSameDay(exam.date, day)),
    }));
  };

  return {
    currentMonth,
    selectedDate,
    viewMode,
    upcomingExams,
    eventsForSelectedDate,
    groupedExams: groupExamsByMonth(),
    calendarData: generateCalendarData(),
    setSelectedDate,
    setViewMode,
    changeMonth,
  };
};
