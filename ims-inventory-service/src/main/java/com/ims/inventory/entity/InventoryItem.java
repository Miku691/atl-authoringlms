package com.ims.inventory.entity;

import jakarta.persistence.*;
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
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String name;
    private String categoryId;
    private String description;
    private String unit; // e.g., Pcs, Kg, Liters
    private Double currentStock;
    private Double reorderLevel;
    private String tenantId;
}
