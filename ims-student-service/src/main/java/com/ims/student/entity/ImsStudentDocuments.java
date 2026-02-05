package com.ims.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "IMS_STUDENT_DOCUMENTS", indexes = {
        @Index(name = "idx_documents_tenant", columnList = "tenant_id"),
        @Index(name = "idx_documents_student", columnList = "student_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentDocuments {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "document_type", nullable = false)
    private String documentType; // E.g., AADHAR, TC, MARK_SHEET

    @Column(name = "document_url", nullable = false)
    private String fileUrl; // S3 Link

    @Column(name = "verification_status")
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
