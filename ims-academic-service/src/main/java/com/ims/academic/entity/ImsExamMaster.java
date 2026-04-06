package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * Entity to represent a top-level Exam Event (e.g., Unit Test 1, Final Exam).
 */
@Entity
@Table(name = "IMS_EXAM_MASTER", indexes = {
        @Index(name = "idx_exam_tenant", columnList = "tenant_id"),
        @Index(name = "idx_exam_session", columnList = "academic_session_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsExamMaster {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "academic_session_id", nullable = false)
    private String academicSessionId;

    @Column(name = "exam_name", nullable = false, length = 255)
    private String examName;

    @Column(name = "exam_type", nullable = false, length = 50)
    private String examType; // e.g., INTERNAL, EXTERNAL, MOCK, FINAL

    @Builder.Default
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;

    @Column(name = "description", length = 500)
    private String description;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
