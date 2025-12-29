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
@Table(name = "IMS_STUDENT_ENROLLMENTS",
        indexes = {
                @Index(name = "idx_enrollment_student", columnList = "student_id"),
                @Index(name = "idx_enrollment_class", columnList = "class_id")
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

    @Column(name = "student_id", nullable = false)
    private String studentId; // FK from students table

    @Column(name = "class_id")
    private String classId; // academic-service class

    @Column(name = "section_id")
    private String sectionId; // academic-service section

    @Column(name = "batch_id")
    private String batchId; // academic-service batch (optional)

    @Column(name = "roll_no")
    private Integer rollNo;

    @Column(name = "academic_year", length = 20)
    private String academicYear; // YYYY-YYYY

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
