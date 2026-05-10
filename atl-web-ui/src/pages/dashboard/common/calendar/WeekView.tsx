import React from 'react';
import {
  format, startOfWeek, addDays, isSameDay, isToday, parseISO,
  differenceInMinutes, startOfDay, addMinutes
} from 'date-fns';
import type { CalendarEvent } from '../../../../api/calendarService';

interface WeekViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 60; // px per hour
const DAY_START_HOUR = 7; // 7 AM
const DAY_END_HOUR   = 21; // 9 PM
const TOTAL_HOURS    = DAY_END_HOUR - DAY_START_HOUR;
const HOURS          = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i);

/**
 * Week view — 7 column day grid with time slots.
 * Events are positioned absolutely based on their start/end time.
 */
const WeekView: React.FC<WeekViewProps> = ({
  selectedDate, events, onSelectDate, onEventClick,
}) => {
  const weekStart = startOfWeek(selectedDate);
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDay = (day: Date) =>
    events.filter(e => {
      try { return isSameDay(parseISO(e.start), day) && !e.allDay; } catch { return false; }
    });

  const getAllDayEventsForDay = (day: Date) =>
    events.filter(e => {
      try { return isSameDay(parseISO(e.start), day) && e.allDay; } catch { return false; }
    });

  /** Converts a datetime to pixel offset from top of the grid */
  const timeToPixels = (dateStr: string): number => {
    try {
      const date = parseISO(dateStr);
      const minutesFromStart = differenceInMinutes(date, startOfDay(date)) - DAY_START_HOUR * 60;
      return Math.max(0, (minutesFromStart / 60) * HOUR_HEIGHT);
    } catch {
      return 0;
    }
  };

  const durationToPixels = (startStr: string, endStr: string): number => {
    try {
      const mins = differenceInMinutes(parseISO(endStr), parseISO(startStr));
      return Math.max(20, (mins / 60) * HOUR_HEIGHT);
    } catch {
      return 40;
    }
  };

  const gridHeight = TOTAL_HOURS * HOUR_HEIGHT;

  return (
    <div className="flex-1 bg-surface rounded-3xl border border-border overflow-hidden flex flex-col min-h-0">
      {/* All-day row + day headers */}
      <div className="grid border-b border-border bg-chrome/50 shrink-0" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="py-3 text-[10px] font-black text-content-muted text-center border-r border-border">
          ALL<br />DAY
        </div>
        {weekDays.map((day, i) => {
          const allDay = getAllDayEventsForDay(day);
          const isCurrentToday = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <div
              key={i}
              className="border-r border-border last:border-r-0"
            >
              <button
                onClick={() => onSelectDate(day)}
                className={[
                  'w-full flex flex-col items-center py-2 transition-colors',
                  isSelected ? 'text-brand' : 'text-content-secondary hover:text-content-primary',
                ].join(' ')}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {format(day, 'EEE')}
                </span>
                <span className={[
                  'w-7 h-7 flex items-center justify-center rounded-full text-sm font-black mt-0.5',
                  isCurrentToday ? 'bg-indigo-600 text-white' : '',
                ].join(' ')}>
                  {format(day, 'd')}
                </span>
              </button>
              {/* All-day events */}
              <div className="px-1 pb-1 space-y-0.5 max-h-16 overflow-y-auto">
                {allDay.map((ev, j) => (
                  <div
                    key={j}
                    onClick={() => onEventClick(ev)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer"
                    style={{ backgroundColor: ev.color + '25', color: ev.color }}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${gridHeight}px`, minHeight: `${gridHeight}px` }}>
          {/* Time labels */}
          <div className="w-14 shrink-0 border-r border-border relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute w-full pr-2 text-right"
                style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT - 8}px` }}
              >
                <span className="text-[10px] font-bold text-content-muted">
                  {format(addMinutes(startOfDay(new Date()), hour * 60), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, di) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={di}
                className="flex-1 border-r border-border last:border-r-0 relative"
                style={{ height: `${gridHeight}px` }}
              >
                {/* Hour grid lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Today highlight */}
                {isToday(day) && (
                  <div className="absolute inset-0 bg-indigo-500/3 pointer-events-none" />
                )}

                {/* Events */}
                {dayEvents.map((ev, ei) => {
                  const top    = timeToPixels(ev.start);
                  const height = durationToPixels(ev.start, ev.end);
                  return (
                    <div
                      key={ei}
                      onClick={() => onEventClick(ev)}
                      className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 cursor-pointer transition-all hover:brightness-110 overflow-hidden z-10"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: ev.color + '20',
                        borderLeft: `3px solid ${ev.color}`,
                      }}
                      title={ev.title}
                    >
                      <p className="text-[10px] font-black leading-tight truncate" style={{ color: ev.color }}>
                        {ev.title}
                      </p>
                      {height > 30 && (
                        <p className="text-[9px] font-medium text-content-muted leading-tight">
                          {format(parseISO(ev.start), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
