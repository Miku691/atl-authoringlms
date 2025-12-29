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
@Table(
        name = "IMS_STAFF",
        indexes = {
                @Index(name = "idx_staff_tenant", columnList = "tenant_id"),
                @Index(name = "idx_staff_user", columnList = "user_id"),
                @Index(name = "idx_staff_contact", columnList = "contact_number")
        }
)
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

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "relation_type", nullable = false, length = 30)
    private RelationType relationType;

    @Column(name = "contact_number", length = 15, nullable = false, unique = true)
    private String contactNumber;

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private StaffStatus status = StaffStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
