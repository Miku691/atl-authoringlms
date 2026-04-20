package com.ims.academic.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentGuardiansDto {
    private String id;
    private String studentId;
    private String guardianName;
    private String guardianRelation;
    private String guardianEmail;
    private String guardianPhone;
    private boolean isPrimary;
}
