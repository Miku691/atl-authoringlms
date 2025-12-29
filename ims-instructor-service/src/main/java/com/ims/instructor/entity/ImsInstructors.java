package com.ims.instructor.entity;

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
@Table(name = "IMS_INSTRUCTORS",
        indexes = {
                @Index(name = "idx_instructor_tenant", columnList = "tenant_id"),
                @Index(name = "idx_instructor_user", columnList = "user_id"),
                @Index(name = "idx_instructor_specialization", columnList = "specialization")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructors {

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
    private String tenantId; // Comes from auth-service

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId; // Reference to auth.users(id)

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "qualification", length = 255)
    private String qualification;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "specialization", length = 255)
    private String specialization;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "status", length = 20)
    private String status;  // active/inactive

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
