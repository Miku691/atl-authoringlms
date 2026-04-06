package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsExamScheduleDto {
    private String id;
    private String examMasterId;
    private String offeringId;
    private String subjectId;
    private String subjectName; // For UI convenience
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double maxMarks;
    private Double passMarks;
    private String roomNumber;
    private String tenantId;
}
