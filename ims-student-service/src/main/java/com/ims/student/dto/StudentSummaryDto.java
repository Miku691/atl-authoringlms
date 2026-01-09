package com.ims.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryDto {
    private String studentId;
    private String enrollmentId;
    private String name;
    private String admissionNo;
    private Integer rollNo;
    private String enrollmentStatus;
    private String avatarUrl; // Optional, for UI
    private String email;
    private String phone;
}
