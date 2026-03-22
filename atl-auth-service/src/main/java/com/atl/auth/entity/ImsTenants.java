package com.atl.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "IMS_TENANTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImsTenants {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_name", nullable = false)
    private String tenantName;

    @Column(name = "tenant_code", nullable = false, unique = true)
    private String tenantCode;

    @Column(name = "address")
    private String address;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "setup_completed")
    private Boolean setupCompleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private com.atl.auth.enums.TenantType type;

    @Column(name = "currency")
    private String currency;

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<AtlUser> users = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
