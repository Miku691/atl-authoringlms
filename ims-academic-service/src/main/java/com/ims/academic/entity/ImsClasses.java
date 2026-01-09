package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_CLASSES", uniqueConstraints = {
                @UniqueConstraint(name = "uk_class_name_tenant", columnNames = { "tenant_id", "name" })
}, indexes = {
                @Index(name = "idx_class_tenant", columnList = "tenant_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsClasses {

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

        // Tenant reference (auth-service)
        @Column(name = "tenant_id", nullable = false)
        private String tenantId;

        // Class display name (e.g., 10, 12, LKG)
        @Column(name = "name", nullable = false, length = 100)
        private String name;

        // Optional internal code
        @Column(name = "code", length = 32)
        private String code;

        // Link to Offering (e.g. Class 10, Semester 1)
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "offering_id", nullable = false)
        private ImsOfferings offering;
}
