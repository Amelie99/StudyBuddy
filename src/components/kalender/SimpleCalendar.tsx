
'use client';

import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { useSimpleCalendar } from '@/hooks/use-simple-calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  eventDays: Date[];
}

const WeekdayHeaders = () => {
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    return (
        <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
            {weekdays.map(day => (
                <div key={day} className="py-2">{day}</div>
            ))}
        </div>
    );
};

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ selectedDate, onDateChange, eventDays }) => {
  const {
    currentMonth,
    days,
    goToNextMonth,
    goToPreviousMonth,
  } = useSimpleCalendar(selectedDate);

  const hasEvent = (date: Date) => eventDays.some(eventDate => isSameDay(eventDate, date));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h2>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <WeekdayHeaders />
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              'relative flex items-center justify-center h-10 w-10 rounded-lg cursor-pointer transition-colors',
              day.isCurrentMonth ? 'text-foreground hover:bg-accent' : 'text-muted-foreground/50 hover:bg-accent',
              isToday(day.date) && 'bg-accent text-accent-foreground',
              isSameDay(day.date, selectedDate) && 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
            onClick={() => onDateChange(day.date)}
          >
            {format(day.date, 'd')}
            {hasEvent(day.date) && day.isCurrentMonth && (
              <div className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
