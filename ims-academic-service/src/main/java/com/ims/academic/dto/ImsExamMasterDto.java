package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsExamMasterDto {
    private String id;
    private String tenantId;
    private String academicSessionId;
    private String examName;
    private String examType;
    private boolean isPublished;
    private String description;
}
