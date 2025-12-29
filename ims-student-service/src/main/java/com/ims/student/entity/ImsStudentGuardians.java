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
@Table(name = "IMS_STUDENT_GUARDIANS",
        indexes = {
                @Index(name = "idx_guardians_student", columnList = "student_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentGuardians {

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

    @Column(name = "guardian_name", nullable = false)
    private String guardianName;

    @Column(name = "relation", nullable = false)
    private String relation;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
