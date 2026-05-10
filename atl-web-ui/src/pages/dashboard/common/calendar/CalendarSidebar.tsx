import React, { useMemo } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Filter, Calendar as CalendarIcon, Clock, MapPin, GraduationCap, Megaphone, CalendarCheck, Users } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../../../../api/calendarService';
import { EVENT_TYPE_CONFIG } from '../../../../api/calendarService';

interface CalendarSidebarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  viewFilter: CalendarEventType[];
  onToggleFilter: (type: CalendarEventType) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const FILTER_OPTIONS: { type: CalendarEventType; Icon: React.ElementType }[] = [
  { type: 'HOLIDAY', Icon: Megaphone },
  { type: 'CLASS',   Icon: GraduationCap },
  { type: 'EXAM',    Icon: CalendarCheck },
  { type: 'EVENT',   Icon: Users },
  { type: 'MEETING', Icon: Clock },
];

/**
 * Right sidebar: layer filter toggles + selected day event list.
 */
const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate, events, viewFilter, onToggleFilter, onEventClick,
}) => {
  const selectedDayEvents = useMemo(() =>
    events
      .filter(e => viewFilter.includes(e.type as CalendarEventType))
      .filter(e => { try { return isSameDay(parseISO(e.start), selectedDate); } catch { return false; } })
      .sort((a, b) => a.start.localeCompare(b.start)),
    [events, viewFilter, selectedDate]
  );

  return (
    <div className="w-80 flex flex-col gap-4 shrink-0">
      {/* ── Layer Filters ── */}
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-black text-content-primary uppercase tracking-widest">Layer Filters</h3>
        </div>
        <div className="space-y-2">
          {FILTER_OPTIONS.map(({ type, Icon }) => {
            const config  = EVENT_TYPE_CONFIG[type];
            const active  = viewFilter.includes(type);
            return (
              <button
                key={type}
                onClick={() => onToggleFilter(type)}
                className={[
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all',
                  active
                    ? 'text-white shadow-sm'
                    : 'border-border text-content-secondary hover:border-border bg-transparent opacity-60 hover:opacity-80',
                ].join(' ')}
                style={active ? { backgroundColor: config.color, borderColor: config.color } : {}}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : 'bg-chrome'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">{config.label}</span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full transition-opacity ${active ? 'bg-white opacity-100' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Day Events ── */}
      <div className="flex-1 bg-surface rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-content-primary">{format(selectedDate, 'EEEE')}</h3>
              <p className="text-xs text-content-muted font-semibold">{format(selectedDate, 'do MMMM')}</p>
            </div>
            <div className="text-[10px] font-black text-brand bg-brand-subtle px-2.5 py-1 rounded-lg uppercase tracking-widest">
              {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Event list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 opacity-30">
              <CalendarIcon className="w-8 h-8 mb-2" />
              <p className="text-xs font-bold text-content-muted">No events for this day</p>
            </div>
          ) : (
            selectedDayEvents.map((event, idx) => (
              <button
                key={idx}
                onClick={() => onEventClick(event)}
                className="w-full text-left group relative pl-3 pr-3 py-3 bg-chrome/50 hover:bg-chrome rounded-xl transition-all border border-transparent hover:border-border"
                style={{ borderLeft: `3px solid ${event.color}` }}
              >
                <div className="flex items-start justify-between mb-0.5">
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {event.type}
                  </span>
                  {!event.allDay && (
                    <div className="flex items-center gap-1 text-[9px] text-content-muted font-bold">
                      <Clock className="w-2.5 h-2.5" />
                      {format(parseISO(event.start), 'h:mm a')}
                    </div>
                  )}
                </div>
                <p className="text-xs font-black text-content-primary mt-1 leading-tight group-hover:text-brand transition-colors">
                  {event.title}
                </p>
                {event.location && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-content-muted font-medium">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
