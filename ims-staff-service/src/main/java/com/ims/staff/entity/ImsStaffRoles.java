package com.ims.staff.entity;

import com.ims.staff.enums.StaffRoleType;
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
        name = "IMS_STAFF_ROLES",
        indexes = {
                @Index(name = "idx_staff_role_staff", columnList = "staff_id"),
                @Index(name = "idx_staff_role_name", columnList = "role_name")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaffRoles {

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

    @Column(name = "staff_id", nullable = false)
    private String staffId; // FK → staff(id)

    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", nullable = false, length = 100)
    private StaffRoleType roleName;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private Instant assignedAt;
}