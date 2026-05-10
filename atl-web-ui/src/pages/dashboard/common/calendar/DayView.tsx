import React from 'react';
import {
  format, isSameDay, parseISO, differenceInMinutes,
  startOfDay, addMinutes
} from 'date-fns';
import type { CalendarEvent } from '../../../../api/calendarService';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 64;
const DAY_START_HOUR = 6;
const DAY_END_HOUR   = 22;
const TOTAL_HOURS    = DAY_END_HOUR - DAY_START_HOUR;
const HOURS          = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i);

const timeToPixels = (dateStr: string): number => {
  try {
    const date = parseISO(dateStr);
    const mins = differenceInMinutes(date, startOfDay(date)) - DAY_START_HOUR * 60;
    return Math.max(0, (mins / 60) * HOUR_HEIGHT);
  } catch { return 0; }
};

const durationToPixels = (s: string, e: string): number => {
  try {
    return Math.max(24, (differenceInMinutes(parseISO(e), parseISO(s)) / 60) * HOUR_HEIGHT);
  } catch { return 40; }
};

/**
 * Single-day view with full-height time grid and detailed event blocks.
 */
const DayView: React.FC<DayViewProps> = ({ selectedDate, events, onEventClick }) => {
  const dayEvents    = events.filter(e => { try { return isSameDay(parseISO(e.start), selectedDate) && !e.allDay; } catch { return false; } });
  const allDayEvents = events.filter(e => { try { return isSameDay(parseISO(e.start), selectedDate) && e.allDay; } catch { return false; } });
  const gridHeight   = TOTAL_HOURS * HOUR_HEIGHT;

  return (
    <div className="flex-1 bg-surface rounded-3xl border border-border overflow-hidden flex flex-col min-h-0">
      {/* Day header */}
      <div className="px-6 py-4 border-b border-border bg-chrome/50 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-content-primary">{format(selectedDate, 'EEEE')}</h2>
            <p className="text-sm text-content-muted font-semibold">{format(selectedDate, 'do MMMM yyyy')}</p>
          </div>
          <div className="text-[10px] font-black text-brand bg-brand-subtle px-3 py-1.5 rounded-lg uppercase tracking-widest">
            {dayEvents.length + allDayEvents.length} Events
          </div>
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allDayEvents.map((ev, i) => (
              <div
                key={i}
                onClick={() => onEventClick(ev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:brightness-110"
                style={{ backgroundColor: ev.color + '20', color: ev.color, border: `1px solid ${ev.color}40` }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                {ev.title}
                <span className="text-[9px] opacity-70 uppercase ml-1">All day</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${gridHeight}px` }}>
          {/* Time labels */}
          <div className="w-16 shrink-0 border-r border-border relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute w-full pr-3 text-right"
                style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT - 9}px` }}
              >
                <span className="text-[11px] font-bold text-content-muted">
                  {format(addMinutes(startOfDay(new Date()), hour * 60), 'h a')}
                </span>
              </div>
            ))}
          </div>

          {/* Event column */}
          <div className="flex-1 relative">
            {/* Hour lines */}
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute w-full border-t border-border/50"
                style={{ top: `${(hour - DAY_START_HOUR) * HOUR_HEIGHT}px` }}
              />
            ))}

            {/* Events */}
            {dayEvents.map((ev, i) => {
              const top    = timeToPixels(ev.start);
              const height = durationToPixels(ev.start, ev.end);
              return (
                <div
                  key={i}
                  onClick={() => onEventClick(ev)}
                  className="absolute left-2 right-4 rounded-xl px-3 py-2 cursor-pointer z-10 transition-all hover:brightness-110 hover:shadow-md overflow-hidden"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: ev.color + '18',
                    borderLeft: `4px solid ${ev.color}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-black leading-tight truncate mr-2" style={{ color: ev.color }}>
                      {ev.title}
                    </p>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                      style={{ backgroundColor: ev.color + '30', color: ev.color }}
                    >
                      {ev.type}
                    </span>
                  </div>
                  {height > 40 && (
                    <p className="text-xs text-content-muted font-medium mt-1">
                      {format(parseISO(ev.start), 'h:mm a')} – {format(parseISO(ev.end), 'h:mm a')}
                    </p>
                  )}
                  {height > 60 && ev.location && (
                    <p className="text-[10px] text-content-muted font-medium mt-0.5 truncate">
                      📍 {ev.location}
                    </p>
                  )}
                </div>
              );
            })}

            {dayEvents.length === 0 && allDayEvents.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                <span className="text-4xl mb-2">📅</span>
                <p className="text-sm font-bold text-content-muted">No events scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
