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
public class BroadcastRequestDto {
    private String tenantId;
    private String senderId;
    private String subject;
    private String messageBody;
    private String targetAudience; // ALL, STUDENTS, INSTRUCTORS, STAFF, SPECIFIC
    private String channel; // EMAIL, IN_APP, BOTH
    private String attachmentUrl;
    private List<String> recipientUserIds;
    private List<String> recipientEmails;
}
