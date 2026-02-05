package com.ims.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentEnrollmentsDto {
    private String id;
    private String tenantId;
    private String studentId;
    private String offeringId;
    private String sectionId;
    private String status;
    private boolean isDeleted;
    private Integer rollNo;
    private String academicYear;
    private Instant createdAt;
    private Instant updatedAt;
}