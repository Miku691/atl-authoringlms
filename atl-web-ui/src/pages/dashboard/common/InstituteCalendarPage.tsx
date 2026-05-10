import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, format
} from 'date-fns';
import { type RootState } from '../../../store/store';
import {
  calendarService,
  type CalendarEvent,
  type CalendarEventType,
} from '../../../api/calendarService';
import toast from 'react-hot-toast';

// Sub-components
import CalendarHeader, { type CalendarViewMode } from './calendar/CalendarHeader';
import CalendarGrid   from './calendar/CalendarGrid';
import WeekView       from './calendar/WeekView';
import DayView        from './calendar/DayView';
import CalendarSidebar from './calendar/CalendarSidebar';
import EventDetailDrawer from './calendar/EventDetailDrawer';
import EventFormModal from './calendar/EventFormModal';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

/** Derived role used for permission checks throughout the calendar */
type CalendarRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

const ALL_FILTER_TYPES: CalendarEventType[] = ['HOLIDAY', 'CLASS', 'EXAM', 'EVENT', 'MEETING'];

const InstituteCalendarPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // ── Derived role ──────────────────────────────────────────────────────────
  const calendarRole = useMemo<CalendarRole>(() => {
    const roles = user?.roles || [];
    if (roles.some(r => r.includes('ADMIN'))) return 'ADMIN';
    if (roles.some(r => r.includes('INSTRUCTOR') || r.includes('TEACHER'))) return 'INSTRUCTOR';
    return 'STUDENT';
  }, [user?.roles]);

  const canAddEvent   = calendarRole === 'ADMIN';
  const canAddMeeting = calendarRole === 'INSTRUCTOR';

  // ── Navigation & view state ───────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // ── Data state ────────────────────────────────────────────────────────────
  const [events, setEvents]   = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [viewFilter, setViewFilter] = useState<CalendarEventType[]>(ALL_FILTER_TYPES);

  // ── Drawer / modal state ──────────────────────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [formOpen, setFormOpen]           = useState(false);
  const [editingEvent, setEditingEvent]   = useState<CalendarEvent | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<CalendarEvent | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd   = endOfMonth(currentMonth);
      const start = format(startOfWeek(monthStart), 'yyyy-MM-dd');
      const end   = format(endOfWeek(monthEnd), 'yyyy-MM-dd');

      // Resolve personId from role
      const personId =
        calendarRole === 'INSTRUCTOR' ? (user.instructorId ?? user.id) :
        calendarRole === 'STUDENT'    ? (user.studentId ?? user.id)    :
        undefined;

      const data = await calendarService.getEvents({
        tenantId: user.tenantId,
        startDate: start,
        endDate: end,
        personId: personId ?? undefined,
        role: user.roles?.[0],
      });
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, user, calendarRole]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Filtered events ───────────────────────────────────────────────────────
  const filteredEvents = useMemo(
    () => events.filter(e => viewFilter.includes(e.type as CalendarEventType)),
    [events, viewFilter]
  );

  // ── Navigation handlers ───────────────────────────────────────────────────
  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    setSelectedDate(prev);
  };
  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    setSelectedDate(next);
  };
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // ── Interaction handlers ──────────────────────────────────────────────────
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setDrawerOpen(false);
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleDeletePrompt = (event: CalendarEvent) => {
    setDrawerOpen(false);
    setDeleteTarget(event);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.sourceId || !user?.tenantId) return;
    try {
      await calendarService.deleteEvent(user.tenantId, deleteTarget.sourceId);
      toast.success('Event deleted');
      setDeleteTarget(null);
      fetchEvents();
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const toggleFilter = (type: CalendarEventType) =>
    setViewFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );

  // ── Permission helpers for the selected event ─────────────────────────────
  const canEditSelectedEvent = useMemo(() => {
    if (!selectedEvent) return false;
    if (!selectedEvent.sourceId) return false; // CLASS / EXAM = not editable
    if (calendarRole === 'ADMIN') return true;
    // Instructor can only edit their own MEETING
    return (
      calendarRole === 'INSTRUCTOR' &&
      selectedEvent.type === 'MEETING' &&
      selectedEvent.instructorId === (user?.instructorId ?? user?.id)
    );
  }, [selectedEvent, calendarRole, user]);

  const canDeleteSelectedEvent = calendarRole === 'ADMIN' && !!selectedEvent?.sourceId;

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-chrome/30 p-4 gap-4 overflow-hidden">
      {/* ── Header ── */}
      <CalendarHeader
        currentMonth={currentMonth}
        viewMode={viewMode}
        canAddEvent={canAddEvent}
        canAddMeeting={canAddMeeting}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onViewChange={setViewMode}
        onAddEvent={handleAddEvent}
      />

      {/* ── Main content ── */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Calendar views */}
        {viewMode === 'month' && (
          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            events={filteredEvents}
            loading={loading}
            onSelectDate={setSelectedDate}
            onEventClick={handleEventClick}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            events={filteredEvents}
            onSelectDate={d => { setSelectedDate(d); }}
            onEventClick={handleEventClick}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            selectedDate={selectedDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        )}

        {/* Sidebar */}
        <CalendarSidebar
          selectedDate={selectedDate}
          events={filteredEvents}
          viewFilter={viewFilter}
          onToggleFilter={toggleFilter}
          onEventClick={handleEventClick}
        />
      </div>

      {/* ── Event Detail Drawer ── */}
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={drawerOpen}
        canEdit={canEditSelectedEvent}
        canDelete={canDeleteSelectedEvent}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeletePrompt}
      />

      {/* ── Create / Edit Modal ── */}
      <EventFormModal
        isOpen={formOpen}
        tenantId={user?.tenantId || ''}
        editingEvent={editingEvent}
        meetingOnly={calendarRole === 'INSTRUCTOR'}
        defaultDate={selectedDate}
        onClose={() => setFormOpen(false)}
        onSaved={fetchEvents}
      />

      {/* ── Delete confirmation ── */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Calendar Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default InstituteCalendarPage;
