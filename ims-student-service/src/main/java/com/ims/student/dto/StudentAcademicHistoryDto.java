package com.ims.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAcademicHistoryDto {
    private String enrollmentId;
    private String offeringId;
    private String offeringName; // From Academic Service
    private String academicYear;
    private String status;
    private String resultStatus; // PROMOTED / RETAINED
    private LocalDate startDate;
    private LocalDate endDate;
}
