import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, LayoutList, Grid3X3 } from 'lucide-react';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  currentMonth: Date;
  viewMode: CalendarViewMode;
  canAddEvent: boolean;
  canAddMeeting: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewChange: (mode: CalendarViewMode) => void;
  onAddEvent: () => void;
}

const VIEW_OPTIONS: { mode: CalendarViewMode; label: string; Icon: React.ElementType }[] = [
  { mode: 'month', label: 'Month', Icon: Grid3X3 },
  { mode: 'week',  label: 'Week',  Icon: LayoutList },
  { mode: 'day',   label: 'Day',   Icon: CalendarDays },
];

/**
 * Top header bar for the calendar — navigation, view toggle, and Add Event button.
 */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  viewMode,
  canAddEvent,
  canAddMeeting,
  onPrevMonth,
  onNextMonth,
  onToday,
  onViewChange,
  onAddEvent,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-border shadow-sm">
      {/* Left: Month + subtitle */}
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-brand-subtle rounded-xl text-brand">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-content-primary tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
          <p className="text-xs text-content-muted font-semibold uppercase tracking-widest">
            Institute Academic &amp; Operations Calendar
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex bg-chrome p-1 rounded-xl gap-0.5">
          {VIEW_OPTIONS.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              onClick={() => onViewChange(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === mode
                  ? 'bg-surface shadow-sm text-content-primary'
                  : 'text-content-muted hover:text-content-secondary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex bg-chrome p-1 rounded-xl">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-surface hover:shadow-sm rounded-lg transition-all text-content-secondary"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 hover:bg-surface hover:shadow-sm rounded-lg transition-all text-xs font-bold text-content-primary"
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-surface hover:shadow-sm rounded-lg transition-all text-content-secondary"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Add Event (admin full, instructor meeting-only) */}
        {(canAddEvent || canAddMeeting) && (
          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" />
            {canAddEvent ? 'Add Event' : 'Add Meeting'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
