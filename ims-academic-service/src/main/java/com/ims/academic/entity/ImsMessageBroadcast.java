package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "IMS_MESSAGE_BROADCASTS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsMessageBroadcast {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "message_body", nullable = false, columnDefinition = "TEXT")
    private String messageBody;

    @Column(name = "target_audience", nullable = false, length = 100)
    private String targetAudience; // ALL, STUDENTS, INSTRUCTORS, STAFF, SPECIFIC

    @Column(name = "channel", nullable = false, length = 50)
    private String channel; // EMAIL, IN_APP, BOTH

    @Column(name = "status", nullable = false, length = 50)
    private String status; // SENT, FAILED, PENDING

    @Column(name = "attachment_url", length = 512)
    private String attachmentUrl;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
    }
}
