package com.ims.inventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "inventory_categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCategory {
    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;
    private String name;
    private String description;
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}

