package com.ims.student.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentLeaveDto {
    private String id;
    private String tenantId;
    private String studentId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate endDate;

    private String reason;
    private String status;
    private String approvedBy;
    private String remarks;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private java.time.Instant createdAt;
}
