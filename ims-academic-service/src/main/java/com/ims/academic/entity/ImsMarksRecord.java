package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

/**
 * Entity to store actual student results/marks.
 */
@Entity
@Table(name = "IMS_MARKS_RECORD", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "exam_schedule_id", "student_id" })
}, indexes = {
        @Index(name = "idx_marks_schedule", columnList = "exam_schedule_id"),
        @Index(name = "idx_marks_student", columnList = "student_id"),
        @Index(name = "idx_marks_tenant", columnList = "tenant_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsMarksRecord {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "exam_schedule_id", nullable = false)
    private String examScheduleId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    /**
     * Marks obtained by student.
     * Use null if not graded yet.
     */
    @Column(name = "marks_obtained")
    private Double marksObtained;

    /**
     * Flag for student's absence for the specific exam paper.
     */
    @Builder.Default
    @Column(name = "is_absent", nullable = false)
    private boolean isAbsent = false;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
