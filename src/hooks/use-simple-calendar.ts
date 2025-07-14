
'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

export const useSimpleCalendar = (initialDate: Date) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialDate));

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: de }); // Starts on Monday
    const endDate = endOfWeek(monthEnd, { locale: de }); // Ends on Sunday

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays.map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, currentMonth),
    }));
  }, [currentMonth]);

  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return {
    currentMonth,
    days,
    goToNextMonth,
    goToPreviousMonth,
  };
};
