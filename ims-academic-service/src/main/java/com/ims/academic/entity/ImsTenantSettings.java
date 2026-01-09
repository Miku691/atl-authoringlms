package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTenantSettings {

    @Id
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "settings", columnDefinition = "TEXT")
    private String settings;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
