package com.ims.staff.entity;

import com.ims.staff.enums.RelationType;
import com.ims.staff.enums.StaffStatus;
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
@Table(name = "IMS_STAFF", indexes = {
        @Index(name = "idx_staff_tenant", columnList = "tenant_id"),
        @Index(name = "idx_staff_user", columnList = "user_id"),
        @Index(name = "idx_staff_contact", columnList = "phone")
}, uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "employee_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaff {

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

    @Column(name = "user_id")
    private String userId;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "phone", length = 20, nullable = false, unique = true)
    private String phone;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "join_date")
    private java.time.LocalDate joinDate;

    @Column(name = "dob")
    private java.time.LocalDate dob;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "role", length = 100)
    private String role;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private StaffStatus status = StaffStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "monthly_salary")
    private Double monthlySalary;

    @Column(name = "qualification", length = 255)
    private String qualification;

    @Column(name = "experience", length = 255)
    private String experience;
}
