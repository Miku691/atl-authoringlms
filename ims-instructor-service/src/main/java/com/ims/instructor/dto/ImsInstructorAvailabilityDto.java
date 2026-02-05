package com.ims.instructor.dto;

import lombok.*;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorAvailabilityDto {
    private String id;
    private String instructorId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isAvailable;
    private String notes;
}
