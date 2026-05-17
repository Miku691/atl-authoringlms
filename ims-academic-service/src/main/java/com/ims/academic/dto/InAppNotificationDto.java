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
public class InAppNotificationDto {
    private String id;
    private String broadcastId;
    private String recipientUserId;
    private String tenantId;
    private String subject;
    private String messageBody;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
