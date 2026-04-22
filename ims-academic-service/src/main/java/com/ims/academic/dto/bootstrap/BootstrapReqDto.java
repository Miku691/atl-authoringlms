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
    private String academicYear; // "2024-2025"

    // --- Type Specific Configs ---
    private SchoolConfig schoolConfig;
    private CollegeConfig collegeConfig;
    private CoachingConfig coachingConfig;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SchoolConfig {
        private String board; // CBSE, ICSE, etc.
        private int startClass; // 1
        private int endClass; // 12
        private int sectionsPerClass; // default 1 (Section A)
        // Future: List<String> specializedStreams; // Science, Commerce
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CollegeConfig {
        private String collegeCategory; // Engineering, Medical, etc.
        private String affiliation; // Affiliating University
        private java.util.List<ProgramReq> programs;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoachingConfig {
        private String affiliation; // Board/Regulatory body
        private java.util.List<ProgramReq> programs;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgramReq {
        private String name; // "Computer Science" or "JEE 2025"
        private String code; // "CSE" or "JEE-25"
        private int numberOfTerms; // 8 semesters or 2 years/batches
        private String termLabel; // "Semester", "Year", "Batch"
    }
}
