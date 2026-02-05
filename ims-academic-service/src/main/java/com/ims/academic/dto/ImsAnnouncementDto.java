package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAnnouncementDto {
    private String id;
    private String tenantId;
    private String title;
    private String content;
    private String targetAudience;
    private String priority;
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;
}
