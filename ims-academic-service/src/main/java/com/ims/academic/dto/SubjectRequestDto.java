package com.ims.academic.dto;

import com.ims.academic.enums.SubjectType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRequestDto {
    private String code;
    private String title;
    private SubjectType subjectType; // THEORY, PRACTICAL, etc.
    private String programId;
    private String tenantId;
    private Integer totalExamMarks;
}
