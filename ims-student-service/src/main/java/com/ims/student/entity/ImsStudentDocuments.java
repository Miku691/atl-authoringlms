package com.ims.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "IMS_STUDENT_DOCUMENTS",
        indexes = {
                @Index(name = "idx_student_document_student", columnList = "student_id")
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

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "file_url", columnDefinition = "TEXT", nullable = false)
    private String fileUrl; // Local storage path

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;
}
