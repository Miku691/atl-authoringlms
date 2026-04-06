package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Entity to represent a specific subject assessment for an offering (class).
 */
@Entity
@Table(name = "IMS_EXAM_SCHEDULE", indexes = {
        @Index(name = "idx_schedule_exam", columnList = "exam_master_id"),
        @Index(name = "idx_schedule_offering", columnList = "offering_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsExamSchedule {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "exam_master_id", nullable = false)
    private String examMasterId;

    @Column(name = "offering_id", nullable = false)
    private String offeringId;

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "max_marks", nullable = false)
    private Double maxMarks;

    @Column(name = "pass_marks", nullable = false)
    private Double passMarks;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
