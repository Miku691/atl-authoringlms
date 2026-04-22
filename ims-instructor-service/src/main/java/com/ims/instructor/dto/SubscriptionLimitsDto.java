package com.ims.instructor.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionLimitsDto {
    private String id;
    private String tenantId;
    private String planId;
    private String planName;
    private Integer maxStudents;
    private Integer maxTeachers;
    private String status;
    private LocalDateTime validUntil;
}
