import React from 'react';
import {
  format, isSameMonth, isSameDay, isToday, eachDayOfInterval,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO
} from 'date-fns';
import type { CalendarEvent } from '../../../../api/calendarService';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  loading: boolean;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Classic month-view grid. Renders 5–6 weeks of day cells,
 * each with up to 3 event pills and a "+N more" overflow count.
 */
const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth, selectedDate, events, loading, onSelectDate, onEventClick,
}) => {
  const monthStart  = startOfMonth(currentMonth);
  const monthEnd    = endOfMonth(monthStart);
  const startDate   = startOfWeek(monthStart);
  const endDate     = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) =>
    events.filter(e => {
      try { return isSameDay(parseISO(e.start), day); } catch { return false; }
    });

  if (loading) {
    return (
      <div className="flex-1 bg-surface rounded-3xl border border-border overflow-hidden flex flex-col">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-border bg-chrome/50">
          {WEEK_DAYS.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-content-muted tracking-widest uppercase">
              {d}
            </div>
          ))}
        </div>
        {/* Skeleton cells */}
        <div className="grid grid-cols-7 flex-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[100px] p-2 border-r border-b border-border animate-pulse">
              <div className="w-6 h-6 rounded-full bg-chrome mb-2" />
              <div className="w-3/4 h-3 rounded bg-chrome mb-1" />
              <div className="w-1/2 h-3 rounded bg-chrome" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface rounded-3xl border border-border overflow-hidden flex flex-col min-h-0">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-chrome/50 shrink-0">
        {WEEK_DAYS.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black text-content-muted tracking-widest uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {days.map((day, idx) => {
          const dayEvents      = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected     = isSameDay(day, selectedDate);
          const isCurrentToday = isToday(day);
          const visible        = dayEvents.slice(0, 3);
          const overflow       = dayEvents.length - visible.length;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={[
                'min-h-[100px] p-2 border-r border-b border-border transition-colors cursor-pointer group',
                !isCurrentMonth ? 'opacity-35 bg-chrome/30' : 'bg-surface hover:bg-brand-subtle/20',
                isSelected && !isCurrentToday ? 'ring-2 ring-inset ring-indigo-500' : '',
              ].join(' ')}
            >
              {/* Date number */}
              <div className="flex justify-start mb-1.5">
                <span className={[
                  'w-7 h-7 flex items-center justify-center rounded-full text-xs font-black transition-all',
                  isCurrentToday
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isSelected
                      ? 'bg-brand-subtle text-brand'
                      : 'text-content-primary group-hover:text-brand',
                ].join(' ')}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Event pills */}
              <div className="space-y-0.5">
                {visible.map((event, eIdx) => (
                  <div
                    key={eIdx}
                    onClick={e => { e.stopPropagation(); onEventClick(event); }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate transition-all hover:brightness-110 cursor-pointer leading-tight"
                    style={{
                      backgroundColor: event.color + '20',
                      color: event.color,
                      borderLeft: `2.5px solid ${event.color}`,
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="text-[10px] text-content-muted font-bold pl-1">
                    +{overflow} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
