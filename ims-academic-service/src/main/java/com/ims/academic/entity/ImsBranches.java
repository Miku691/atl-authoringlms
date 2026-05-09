package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_BRANCHES", uniqueConstraints = {
        @UniqueConstraint(name = "uk_branch_name_tenant", columnNames = {"tenant_id", "program_id", "name"})
}, indexes = {
        @Index(name = "idx_branch_tenant", columnList = "tenant_id"),
        @Index(name = "idx_branch_program", columnList = "program_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsBranches {

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

    @Column(name = "program_id", nullable = false)
    private String programId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", length = 32)
    private String code;
}
