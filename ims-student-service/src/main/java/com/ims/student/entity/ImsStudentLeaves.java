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
import java.time.LocalDate;

@Entity
@Table(name = "IMS_STUDENT_LEAVES", indexes = {
        @Index(name = "idx_leaves_tenant", columnList = "tenant_id"),
        @Index(name = "idx_leaves_student", columnList = "student_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentLeaves {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", length = 20)
    private String status; // PENDING, APPROVED, REJECTED, CANCELLED

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
