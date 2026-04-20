package com.ims.academic.service.impl;

import com.ims.academic.client.StudentClient;
import com.ims.academic.dto.CalendarEventDto;
import com.ims.academic.dto.external.ImsStudentEnrollmentsDto;
import com.ims.academic.entity.ImsExamSchedule;
import com.ims.academic.entity.ImsInstituteEvents;
import com.ims.academic.entity.ImsTimetableEntries;
import com.ims.academic.entity.ImsTimetableSlots;
import com.ims.academic.repo.ImsExamScheduleRepo;
import com.ims.academic.repo.ImsInstituteEventsRepo;
import com.ims.academic.repo.ImsTimetableEntriesRepo;
import com.ims.academic.service.ImsCalendarService;
import com.ims.academic.util.ApiResponse;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImsCalendarServiceImpl implements ImsCalendarService {

    private final ImsInstituteEventsRepo eventsRepo;
    private final ImsTimetableEntriesRepo timetableRepo;
    private final ImsExamScheduleRepo examRepo;
    private final StudentClient studentClient;

    @Override
    public List<CalendarEventDto> getCalendarEvents(String tenantId, LocalDate startDate, LocalDate endDate, String personId, String role) {
        List<CalendarEventDto> allEvents = new ArrayList<>();

        // 1. Fetch Institute Events (Holidays, Meetings)
        List<ImsInstituteEvents> instituteEvents = eventsRepo.findByTenantIdAndEndDateAfterAndStartDateBefore(
                tenantId, startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
        
        instituteEvents.stream()
                .filter(e -> isVisibleToRole(e, role))
                .forEach(e -> allEvents.add(mapInstituteEvent(e)));

        // 2. Fetch Exam Schedules
        List<ImsExamSchedule> exams = examRepo.findByTenantIdAndExamDateBetween(tenantId, startDate, endDate);
        exams.forEach(ex -> allEvents.add(mapExamEvent(ex)));

        // 3. Fetch Timetable Classes (Recurring)
        if (personId != null && role != null) {
            List<ImsTimetableEntries> recurringEntries = fetchTimetableEntries(personId, role, tenantId);
            allEvents.addAll(expandRecurringClasses(recurringEntries, startDate, endDate));
        }

        return allEvents;
    }

    private boolean isVisibleToRole(ImsInstituteEvents event, String role) {
        if ("ALL".equalsIgnoreCase(event.getTargetAudience())) return true;
        if (role == null) return false;
        return event.getTargetAudience().equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);
    }

    private List<ImsTimetableEntries> fetchTimetableEntries(String personId, String role, String tenantId) {
        if ("TEACHER".equalsIgnoreCase(role) || "INSTRUCTOR".equalsIgnoreCase(role)) {
            return timetableRepo.findByInstructorId(personId);
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            ApiResponse<List<ImsStudentEnrollmentsDto>> enrollmentRes = studentClient.getEnrollmentsByStudentId(personId);
            if (enrollmentRes != null && enrollmentRes.getApiData() != null) {
                List<String> offeringIds = enrollmentRes.getApiData().stream()
                        .map(ImsStudentEnrollmentsDto::getOfferingId)
                        .collect(Collectors.toList());
                
                // Fetch entries for these offerings (Assuming a simple loop or optimized query)
                List<ImsTimetableEntries> studentEntries = new ArrayList<>();
                for (String offeringId : offeringIds) {
                    // Need a repo method for this
                    // studentEntries.addAll(timetableRepo.findByOfferingId(offeringId));
                }
                // Filtering by tenant done in aggregator or individual queries
                return studentEntries;
            }
        }
        return Collections.emptyList();
    }

    private List<CalendarEventDto> expandRecurringClasses(List<ImsTimetableEntries> entries, LocalDate start, LocalDate end) {
        List<CalendarEventDto> expanded = new ArrayList<>();
        
        for (ImsTimetableEntries entry : entries) {
            ImsTimetableSlots slot = entry.getTimetableSlot();
            if (slot == null || slot.getDayOfWeek() == null) continue;

            DayOfWeek targetDay = DayOfWeek.of(slot.getDayOfWeek());
            
            LocalDate current = start;
            while (!current.isAfter(end)) {
                if (current.getDayOfWeek() == targetDay) {
                    expanded.add(CalendarEventDto.builder()
                            .id("CLASS-" + entry.getId() + "-" + current)
                            .title(entry.getSubjectId() + " Class")
                            .start(LocalDateTime.of(current, slot.getStartTime()))
                            .end(LocalDateTime.of(current, slot.getEndTime()))
                            .type("CLASS")
                            .color("#4F46E5") // Indigo
                            .location(entry.getRoom())
                            .allDay(false)
                            .metadata(entry)
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
                .title(event.getTitle())
                .description(event.getDescription())
                .start(event.getStartDate())
                .end(event.getEndDate())
                .type(event.getType())
                .color(event.getColor() != null ? event.getColor() : "#F59E0B") // Amber default
                .location(event.getLocation())
                .allDay(event.isFullDay())
                .build();
    }

    private CalendarEventDto mapExamEvent(ImsExamSchedule exam) {
        return CalendarEventDto.builder()
                .id("EXAM-" + exam.getId())
                .title("Exam: " + exam.getSubjectId())
                .start(LocalDateTime.of(exam.getExamDate(), exam.getStartTime()))
                .end(LocalDateTime.of(exam.getExamDate(), exam.getEndTime()))
                .type("EXAM")
                .color("#EF4444") // Red
                .location(exam.getRoomNumber())
                .allDay(false)
                .metadata(exam)
                .build();
    }
}
