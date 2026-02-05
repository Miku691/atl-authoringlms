package com.ims.academic.dto;

import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassScheduleDto {
    private String id;
    private String tenantId;
    private String offeringId;
    private String subjectId;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomNumber;
    private String instructorId;
    private String subjectName; // For UI
    private String instructorName; // For UI
}
