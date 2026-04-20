package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDto {
    private String id;
    private String title;
    private String description;
    private LocalDateTime start;
    private LocalDateTime end;
    private String type; // HOLIDAY, CLASS, EXAM, EVENT, MEETING
    private String color;
    private String location;
    private boolean allDay;
    private Object metadata; // For linking to details (SubjectId, ExamId, etc.)
}
