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
@Table(name = "IMS_STUDENTS", indexes = {
        @Index(name = "idx_students_tenant", columnList = "tenant_id"),
        @Index(name = "idx_students_admission_no", columnList = "admission_no")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudents {
    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "phone", unique = true)
    private String phone;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "admission_no", unique = true)
    private String admissionNo;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "religion", length = 50)
    private String religion;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "status", length = 50)
    private String status; // ACTIVE / INACTIVE

    @Column(name = "is_deleted")
    @Builder.Default
    private boolean isDeleted = false;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(name = "previous_education", columnDefinition = "TEXT")
    private String previousEducation;

    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "mother_name")
    private String motherName;

    @Column(name = "id_proof_type", length = 50)
    private String idProofType; // E.g., AADHAR, PAN, NATIONAL_ID

    @Column(name = "id_proof_number", length = 50)
    private String idProofNumber;

    @Column(name = "ethnicity", length = 50)
    private String ethnicity;

    @Column(name = "languages", length = 255)
    private String languages;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "marital_status", length = 20)
    private String maritalStatus;

    @Column(name = "enrollment_type", length = 20)
    private String enrollmentType; // FULL_TIME, DISTANCE

    @Column(name = "previous_school", length = 255)
    private String previousSchool;

    @Column(name = "admission_discount")
    private Double admissionDiscount;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}