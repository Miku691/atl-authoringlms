package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO representing a single calendar event sent to the frontend.
 * Covers holidays, institute events, meetings, recurring classes, and exams.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDto {

    /** Composite ID — e.g. "EVENT-uuid", "CLASS-entryId-date", "EXAM-uuid" */
    private String id;

    private String title;
    private String description;

    /** ISO-8601 datetime, e.g. 2026-05-10T09:00:00 */
    private LocalDateTime start;
    private LocalDateTime end;

    /** One of: HOLIDAY, CLASS, EXAM, EVENT, MEETING */
    private String type;

    /** Hex colour for UI rendering, e.g. #4F46E5 */
    private String color;

    private String location;
    private boolean allDay;

    // ── Typed reference IDs (replaces unsafe Object metadata) ──
    /** Populated for CLASS and EXAM events */
    private String subjectId;

    /** Populated for CLASS events */
    private String offeringId;

    /** Populated for EXAM events */
    private String examMasterId;

    /** Populated for CLASS events */
    private String instructorId;

    /**
     * For institute events (HOLIDAY, EVENT, MEETING) — the raw entity id
     * so the frontend can call PUT/DELETE /calendar/events/{sourceId}.
     */
    private String sourceId;

    /** Audience visibility: ALL, TEACHER, STUDENT, ADMIN */
    private String targetAudience;
}
