package com.ims.student.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentGuardianMappingDto {
    private String id;
    private String studentId;
    private String guardianId;
    private String tenantId;
    private String relation;
    private boolean isPrimary;

    // Optional: for convenience in UI responses
    private String studentName;
    private String guardianName;
    private String guardianPhone;
}
