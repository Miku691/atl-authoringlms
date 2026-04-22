package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_SECTIONS", uniqueConstraints = {
                @UniqueConstraint(name = "uk_section_name_class_offering", columnNames = { "class_id", "offering_id", "name" })
}, indexes = {
                @Index(name = "idx_section_tenant", columnList = "tenant_id"),
                @Index(name = "idx_section_class", columnList = "class_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsSections {

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

        // Internal academic-service mapping
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "class_id", nullable = false)
        private ImsClasses imsClass;

        // Section label (A, B, C)
        @Column(name = "name", nullable = false, length = 50)
        private String name;

        // Link to Offering (e.g. Class 10 - A)
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "offering_id", nullable = false)
        private ImsOfferings offering;
}
