package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorAssignmentDto {
    private String id;
    private String offeringId;
    private String instructorId;
    private String subjectId;
    private String role; // e.g., PRIMARY, SUBSTITUTE
    private LocalDate startDate;
    private LocalDate endDate;
}
