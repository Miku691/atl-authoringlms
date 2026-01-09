package com.ims.academic.dto.bootstrap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BootstrapReqDto {
    private String tenantId;
    private InstitutionType institutionType;
    private String board; // For schools
    private String academicYear; // "2024-2025"
    private int numberOfLevels; // e.g., 12 for school, 8 for semesters
}
