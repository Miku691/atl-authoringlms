package com.ims.academic.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentEnrollmentsDto {
    private String id;
    private String studentId;
    private String offeringId;
    private String enrollmentStatus;
    private String tenantId;
}
