package com.ims.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "IMS_STUDENT_ENROLLMENTS", indexes = {
        @Index(name = "idx_enrollment_tenant", columnList = "tenant_id"),
        @Index(name = "idx_enrollment_student", columnList = "student_id"),
        @Index(name = "idx_enrollment_offering", columnList = "offering_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentEnrollments {

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

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "offering_id", nullable = false)
    private String offeringId; // UUID of Offering (Class/Batch/Semester)

    @Column(name = "section_id")
    private String sectionId; // UUID of Section (Optional)

    @Column(name = "status", length = 20)
    private String status; // ACTIVE / COMPLETED / WITHDRAWN

    @Column(name = "result_status", length = 20)
    private String resultStatus; // PASS / FAIL / PROBATION

    @Column(name = "academic_snapshot", columnDefinition = "TEXT")
    private String academicSnapshot; // JSON snapshot of grades/GPA

    @Column(name = "is_deleted")
    @Builder.Default
    private boolean isDeleted = false;

    @Column(name = "roll_no")
    private Integer rollNo;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
