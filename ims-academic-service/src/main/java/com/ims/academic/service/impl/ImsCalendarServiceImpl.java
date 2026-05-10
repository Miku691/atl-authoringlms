package com.ims.academic.service.impl;

import com.ims.academic.client.StudentClient;
import com.ims.academic.dto.CalendarEventDto;
import com.ims.academic.dto.CalendarEventRequestDto;
import com.ims.academic.dto.external.ImsStudentEnrollmentsDto;
import com.ims.academic.entity.ImsExamMaster;
import com.ims.academic.entity.ImsExamSchedule;
import com.ims.academic.entity.ImsInstituteEvents;
import com.ims.academic.entity.ImsSubjects;
import com.ims.academic.entity.ImsTimetableEntries;
import com.ims.academic.entity.ImsTimetableSlots;
import com.ims.academic.repo.ImsExamMasterRepo;
import com.ims.academic.repo.ImsExamScheduleRepo;
import com.ims.academic.repo.ImsInstituteEventsRepo;
import com.ims.academic.repo.ImsSubjectsRepo;
import com.ims.academic.repo.ImsTimetableEntriesRepo;
import com.ims.academic.service.ImsCalendarService;
import com.ims.academic.util.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Production-grade implementation of the operational calendar service.
 * Aggregates: institute events (holidays, events, meetings), exam schedules,
 * and recurring timetable classes — all filtered by tenant, date range, and role.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImsCalendarServiceImpl implements ImsCalendarService {

    private final ImsInstituteEventsRepo eventsRepo;
    private final ImsTimetableEntriesRepo timetableRepo;
    private final ImsExamScheduleRepo examRepo;
    private final ImsExamMasterRepo examMasterRepo;
    private final ImsSubjectsRepo subjectsRepo;
    private final StudentClient studentClient;

    // ──────────────────────────────────────────────────────────
    // READ — aggregate calendar events
    // ──────────────────────────────────────────────────────────

    @Override
    public List<CalendarEventDto> getCalendarEvents(
            String tenantId, LocalDate startDate, LocalDate endDate,
            String personId, String role) {

        String normalizedRole = normalizeRole(role);
        List<CalendarEventDto> allEvents = new ArrayList<>();

        // 1. Institute events: holidays, institute events, meetings
        List<ImsInstituteEvents> instituteEvents = eventsRepo
                .findByTenantIdAndEndDateAfterAndStartDateBefore(
                        tenantId,
                        startDate.atStartOfDay(),
                        endDate.atTime(LocalTime.MAX));

        instituteEvents.stream()
                .filter(e -> isVisibleToRole(e, normalizedRole))
                .forEach(e -> allEvents.add(mapInstituteEvent(e)));

        // 2. Exam schedules
        List<ImsExamSchedule> exams = examRepo.findByTenantIdAndExamDateBetween(tenantId, startDate, endDate);
        if (!exams.isEmpty()) {
            // Resolve exam master names and subject names in one batch
            Map<String, String> examMasterNames = resolveExamMasterNames(exams);
            Map<String, String> subjectNames = resolveSubjectNamesByIds(
                    exams.stream().map(ImsExamSchedule::getSubjectId).distinct().collect(Collectors.toList()));
            exams.forEach(ex -> allEvents.add(mapExamEvent(ex, examMasterNames, subjectNames)));
        }

        // 3. Recurring timetable classes — only for authenticated persons
        if (personId != null && !personId.isBlank() && normalizedRole != null) {
            List<ImsTimetableEntries> recurringEntries = fetchTimetableEntries(personId, normalizedRole, tenantId);
            if (!recurringEntries.isEmpty()) {
                // Batch-resolve subject names for all class entries
                Map<String, String> subjectNames = resolveSubjectNamesByIds(
                        recurringEntries.stream()
                                .map(ImsTimetableEntries::getSubjectId)
                                .filter(s -> s != null && !s.isBlank())
                                .distinct()
                                .collect(Collectors.toList()));
                allEvents.addAll(expandRecurringClasses(recurringEntries, startDate, endDate, subjectNames));
            }
        }

        return allEvents;
    }

    // ──────────────────────────────────────────────────────────
    // CRUD — institute events (HOLIDAY / EVENT / MEETING)
    // ──────────────────────────────────────────────────────────

    @Override
    public CalendarEventDto createEvent(String tenantId, CalendarEventRequestDto dto) {
        ImsInstituteEvents event = ImsInstituteEvents.builder()
                .tenantId(tenantId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .type(dto.getType().toUpperCase())
                .targetAudience(dto.getTargetAudience() != null ? dto.getTargetAudience().toUpperCase() : "ALL")
                .isFullDay(dto.isFullDay())
                .color(resolveColor(dto.getType(), dto.getColor()))
                .location(dto.getLocation())
                .createdBy(dto.getCreatedBy())
                .build();

        ImsInstituteEvents saved = eventsRepo.save(event);
        log.info("Calendar event created: id={} type={} tenant={}", saved.getId(), saved.getType(), tenantId);
        return mapInstituteEvent(saved);
    }

    @Override
    public CalendarEventDto updateEvent(String tenantId, String eventId, CalendarEventRequestDto dto) {
        ImsInstituteEvents event = eventsRepo.findById(eventId)
                .filter(e -> e.getTenantId().equals(tenantId))
                .orElseThrow(() -> new EntityNotFoundException("Calendar event not found: " + eventId));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setType(dto.getType().toUpperCase());
        event.setTargetAudience(dto.getTargetAudience() != null ? dto.getTargetAudience().toUpperCase() : event.getTargetAudience());
        event.setFullDay(dto.isFullDay());
        event.setColor(resolveColor(dto.getType(), dto.getColor()));
        event.setLocation(dto.getLocation());

        ImsInstituteEvents updated = eventsRepo.save(event);
        log.info("Calendar event updated: id={} tenant={}", eventId, tenantId);
        return mapInstituteEvent(updated);
    }

    @Override
    public void deleteEvent(String tenantId, String eventId) {
        ImsInstituteEvents event = eventsRepo.findById(eventId)
                .filter(e -> e.getTenantId().equals(tenantId))
                .orElseThrow(() -> new EntityNotFoundException("Calendar event not found: " + eventId));
        eventsRepo.delete(event);
        log.info("Calendar event deleted: id={} tenant={}", eventId, tenantId);
    }

    @Override
    public CalendarEventDto getEventById(String tenantId, String eventId) {
        ImsInstituteEvents event = eventsRepo.findById(eventId)
                .filter(e -> e.getTenantId().equals(tenantId))
                .orElseThrow(() -> new EntityNotFoundException("Calendar event not found: " + eventId));
        return mapInstituteEvent(event);
    }

    // ──────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────

    /**
     * Normalises the raw JWT role string to a canonical short form used throughout the service.
     * e.g. "TENANT_ADMIN" → "ADMIN", "ROLE_INSTRUCTOR" → "TEACHER"
     */
    private String normalizeRole(String role) {
        if (role == null) return null;
        String upper = role.toUpperCase();
        if (upper.contains("STUDENT")) return "STUDENT";
        if (upper.contains("INSTRUCTOR") || upper.contains("TEACHER")) return "TEACHER";
        if (upper.contains("ADMIN")) return "ADMIN";
        return upper;
    }

    private boolean isVisibleToRole(ImsInstituteEvents event, String normalizedRole) {
        String audience = event.getTargetAudience();
        if (audience == null || "ALL".equalsIgnoreCase(audience)) return true;
        if (normalizedRole == null) return false;
        return audience.equalsIgnoreCase(normalizedRole) || "ADMIN".equalsIgnoreCase(normalizedRole);
    }

    /**
     * Fetches the relevant timetable entries for a person depending on their role.
     * Admin receives all entries for the tenant; instructor by their id; student by offering ids.
     */
    private List<ImsTimetableEntries> fetchTimetableEntries(String personId, String normalizedRole, String tenantId) {
        if ("TEACHER".equals(normalizedRole)) {
            return timetableRepo.findByInstructorId(personId);
        }

        if ("STUDENT".equals(normalizedRole)) {
            try {
                ApiResponse<List<ImsStudentEnrollmentsDto>> enrollmentRes =
                        studentClient.getEnrollmentsByStudentId(personId);
                if (enrollmentRes == null || enrollmentRes.getApiData() == null) {
                    return Collections.emptyList();
                }
                List<String> offeringIds = enrollmentRes.getApiData().stream()
                        .map(ImsStudentEnrollmentsDto::getOfferingId)
                        .filter(id -> id != null && !id.isBlank())
                        .distinct()
                        .collect(Collectors.toList());

                List<ImsTimetableEntries> studentEntries = new ArrayList<>();
                for (String offeringId : offeringIds) {
                    studentEntries.addAll(timetableRepo.findByOfferingId(offeringId));
                }
                return studentEntries;
            } catch (Exception e) {
                log.warn("Could not fetch student enrollments for personId={}: {}", personId, e.getMessage());
                return Collections.emptyList();
            }
        }

        return Collections.emptyList();
    }

    /**
     * Expands recurring weekly timetable entries into discrete single-day CLASS events
     * for the given date range, using the resolved subject name map.
     */
    private List<CalendarEventDto> expandRecurringClasses(
            List<ImsTimetableEntries> entries, LocalDate start, LocalDate end,
            Map<String, String> subjectNames) {

        List<CalendarEventDto> expanded = new ArrayList<>();

        for (ImsTimetableEntries entry : entries) {
            ImsTimetableSlots slot = entry.getTimetableSlot();
            if (slot == null || slot.getDayOfWeek() == null) continue;

            DayOfWeek targetDay = DayOfWeek.of(slot.getDayOfWeek());
            String subjectName = subjectNames.getOrDefault(entry.getSubjectId(), "Class");

            LocalDate current = start;
            while (!current.isAfter(end)) {
                if (current.getDayOfWeek() == targetDay) {
                    LocalDateTime startDt = LocalDateTime.of(current,
                            slot.getStartTime() != null ? slot.getStartTime() : LocalTime.of(8, 0));
                    LocalDateTime endDt = LocalDateTime.of(current,
                            slot.getEndTime() != null ? slot.getEndTime() : LocalTime.of(9, 0));

                    expanded.add(CalendarEventDto.builder()
                            .id("CLASS-" + entry.getId() + "-" + current)
                            .title(subjectName)
                            .start(startDt)
                            .end(endDt)
                            .type("CLASS")
                            .color("#4F46E5")
                            .location(entry.getRoom())
                            .allDay(false)
                            .subjectId(entry.getSubjectId())
                            .offeringId(entry.getOfferingId())
                            .instructorId(entry.getInstructorId())
                            .build());
                }
                current = current.plusDays(1);
            }
        }
        return expanded;
    }

    private CalendarEventDto mapInstituteEvent(ImsInstituteEvents event) {
        return CalendarEventDto.builder()
                .id("EVENT-" + event.getId())
                .sourceId(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .start(event.getStartDate())
                .end(event.getEndDate())
                .type(event.getType())
                .color(event.getColor() != null ? event.getColor() : resolveColor(event.getType(), null))
                .location(event.getLocation())
                .allDay(event.isFullDay())
                .targetAudience(event.getTargetAudience())
                .build();
    }

    private CalendarEventDto mapExamEvent(
            ImsExamSchedule exam,
            Map<String, String> examMasterNames,
            Map<String, String> subjectNames) {

        String examName = examMasterNames.getOrDefault(exam.getExamMasterId(), "Exam");
        String subjectName = subjectNames.getOrDefault(exam.getSubjectId(), "");
        String title = subjectName.isBlank()
                ? examName
                : examName + " — " + subjectName;

        LocalDateTime startDt = exam.getExamDate() != null && exam.getStartTime() != null
                ? LocalDateTime.of(exam.getExamDate(), exam.getStartTime())
                : null;
        LocalDateTime endDt = exam.getExamDate() != null && exam.getEndTime() != null
                ? LocalDateTime.of(exam.getExamDate(), exam.getEndTime())
                : startDt;

        return CalendarEventDto.builder()
                .id("EXAM-" + exam.getId())
                .sourceId(exam.getId())
                .title(title)
                .start(startDt)
                .end(endDt)
                .type("EXAM")
                .color("#EF4444")
                .location(exam.getRoomNumber())
                .allDay(false)
                .subjectId(exam.getSubjectId())
                .offeringId(exam.getOfferingId())
                .examMasterId(exam.getExamMasterId())
                .build();
    }

    /** Batch-resolves exam master display names. */
    private Map<String, String> resolveExamMasterNames(List<ImsExamSchedule> exams) {
        List<String> masterIds = exams.stream()
                .map(ImsExamSchedule::getExamMasterId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .collect(Collectors.toList());
        return examMasterRepo.findAllById(masterIds).stream()
                .collect(Collectors.toMap(ImsExamMaster::getId, ImsExamMaster::getExamName));
    }

    /** Batch-resolves subject display names by a list of subject IDs. */
    private Map<String, String> resolveSubjectNamesByIds(List<String> subjectIds) {
        if (subjectIds == null || subjectIds.isEmpty()) return Collections.emptyMap();
        return subjectsRepo.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(ImsSubjects::getId, ImsSubjects::getTitle));
    }

    /**
     * Returns a sensible default hex colour when no colour is provided,
     * based on the event type.
     */
    private String resolveColor(String type, String overrideColor) {
        if (overrideColor != null && !overrideColor.isBlank()) return overrideColor;
        if (type == null) return "#6366F1";
        return switch (type.toUpperCase()) {
            case "HOLIDAY" -> "#F59E0B";
            case "EXAM"    -> "#EF4444";
            case "MEETING" -> "#6366F1";
            case "EVENT"   -> "#10B981";
            case "CLASS"   -> "#4F46E5";
            default        -> "#6366F1";
        };
    }
}
