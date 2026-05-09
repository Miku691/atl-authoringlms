package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_YEARS", uniqueConstraints = {
        @UniqueConstraint(name = "uk_year_name_tenant", columnNames = {"tenant_id", "branch_id", "name"})
}, indexes = {
        @Index(name = "idx_year_tenant", columnList = "tenant_id"),
        @Index(name = "idx_year_branch", columnList = "branch_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsYears {

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

    @Column(name = "branch_id", nullable = false)
    private String branchId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "year_number")
    private Integer yearNumber;
}
