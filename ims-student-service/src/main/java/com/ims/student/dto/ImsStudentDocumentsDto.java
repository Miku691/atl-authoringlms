package com.ims.student.dto;

import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentDocumentsDto {
    private String id;
    private String tenantId;
    private String studentId;
    private String documentType;
    private String documentUrl;
    private String verificationStatus;
    private String uploadedBy;
    private Instant createdAt;
    private Instant updatedAt;
}
