package com.ims.platform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ImsTenantSubscriptionsDto {
    private String id;
    private String tenantId;
    private String planId;
    private String planName;
    private Integer maxStudents;
    private Integer maxTeachers;
    private Integer maxStaff;
    private Integer maxGuardians;
    private String status;
    private LocalDateTime validUntil;
    private LocalDateTime createdAt;
}
