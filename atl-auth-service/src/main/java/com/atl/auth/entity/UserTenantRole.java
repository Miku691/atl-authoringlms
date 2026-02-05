package com.atl.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_tenant_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTenantRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AtlUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = true) // Nullable for global admins or pre-assignment
    private ImsTenants tenant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private AtlRole role;

    // Helper to ensure we can identify the tenant easily/uniquely if needed
    // but the object relation is cleaner.
}
