package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsMarksRecordDto {
    private String id;
    private String examScheduleId;
    private String studentId;
    private String studentName; // For UI context
    private String rollNo;
    private Double marksObtained;
    private boolean isAbsent;
    private String remarks;
    private String tenantId;
    
    // Dynamic fields calculated from GradingScale
    private String gradeLabel;
    private Double gradePoint;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class BatchMarksEntryDto {
    private String examScheduleId;
    private String tenantId;
    private List<ImsMarksRecordDto> marks;
}
