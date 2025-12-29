package com.ims.instructor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(
        name = "IMS_INSTRUCTOR_SUBJECTS",
        indexes = {
                @Index(name = "idx_instr_sub_instr", columnList = "instructor_id"),
                @Index(name = "idx_instr_sub_subject", columnList = "subject_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorSubjects {

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

    @Column(name = "instructor_id", nullable = false)
    private String instructorId; // FK → instructors(id)

    @Column(name = "subject_id", nullable = false)
    private String subjectId; // FK → academic.subjects(id)

    @Column(name = "level", nullable = false, length = 30)
    private String level; // primary / secondary / higher-ed

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
