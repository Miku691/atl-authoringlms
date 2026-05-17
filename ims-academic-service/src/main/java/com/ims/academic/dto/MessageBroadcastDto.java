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
public class MessageBroadcastDto {
    private String id;
    private String tenantId;
    private String senderId;
    private String subject;
    private String messageBody;
    private String targetAudience;
    private String channel;
    private String status;
    private String attachmentUrl;
    private LocalDateTime sentAt;
}
