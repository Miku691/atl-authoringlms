import api from '../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CalendarEventType = 'HOLIDAY' | 'CLASS' | 'EXAM' | 'EVENT' | 'MEETING';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO datetime string "2026-05-10T09:00:00"
  end: string;
  type: CalendarEventType;
  color: string;
  location?: string;
  allDay: boolean;
  // Typed reference IDs
  subjectId?: string;
  offeringId?: string;
  examMasterId?: string;
  instructorId?: string;
  /** Entity id of ImsInstituteEvents — used for PUT/DELETE */
  sourceId?: string;
  targetAudience?: string;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  startDate: string; // ISO datetime
  endDate: string;
  type: string;
  targetAudience: string;
  fullDay: boolean;
  color?: string;
  location?: string;
}

export interface CalendarFetchParams {
  tenantId: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;
  personId?: string;
  role?: string;
}

// ─── Event type config (colour + label) ──────────────────────────────────────

export const EVENT_TYPE_CONFIG: Record<CalendarEventType, { label: string; color: string }> = {
  HOLIDAY: { label: 'Holiday',        color: '#F59E0B' },
  CLASS:   { label: 'Class',          color: '#4F46E5' },
  EXAM:    { label: 'Exam',           color: '#EF4444' },
  EVENT:   { label: 'Institute Event',color: '#10B981' },
  MEETING: { label: 'Meeting',        color: '#6366F1' },
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const calendarService = {
  /**
   * Fetches merged, role-filtered calendar events for the given date range.
   */
  async getEvents(params: CalendarFetchParams): Promise<CalendarEvent[]> {
    const response = await api.get('/ims-academic-service/calendar/summary', { params });
    const data = response.data;
    if (data.status === 'SUCCESS') {
      return (data.apiData as CalendarEvent[]) || [];
    }
    return [];
  },

  /**
   * Creates a new institute event (admin: HOLIDAY/EVENT/MEETING; instructor: MEETING only).
   */
  async createEvent(tenantId: string, payload: CalendarEventRequest): Promise<CalendarEvent> {
    const response = await api.post(
      `/ims-academic-service/calendar/events?tenantId=${tenantId}`,
      payload
    );
    return response.data.apiData as CalendarEvent;
  },

  /**
   * Updates an existing institute event by its entity sourceId.
   */
  async updateEvent(
    tenantId: string,
    sourceId: string,
    payload: Partial<CalendarEventRequest>
  ): Promise<CalendarEvent> {
    const response = await api.put(
      `/ims-academic-service/calendar/events/${sourceId}?tenantId=${tenantId}`,
      payload
    );
    return response.data.apiData as CalendarEvent;
  },

  /**
   * Deletes an institute event by its entity sourceId.
   */
  async deleteEvent(tenantId: string, sourceId: string): Promise<void> {
    await api.delete(
      `/ims-academic-service/calendar/events/${sourceId}?tenantId=${tenantId}`
    );
  },
};
