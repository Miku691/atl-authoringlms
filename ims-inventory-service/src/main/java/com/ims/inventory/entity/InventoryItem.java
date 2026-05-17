package com.ims.inventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "inventory_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {
    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;
    private String name;
    private String categoryId;
    private String description;
    private String unit; // e.g., Pcs, Kg, Liters
    private Double currentStock;
    private Double reorderLevel;
    @Enumerated(EnumType.STRING)
    private ItemType itemType; // CONSUMABLE, ASSET
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.itemType == null) {
            this.itemType = ItemType.CONSUMABLE;
        }
    }

    public enum ItemType {
        CONSUMABLE, ASSET
    }
}

