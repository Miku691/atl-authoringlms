package com.ims.inventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;
    private String name;
    private String categoryId;
    private String itemId; // Link to master InventoryItem
    private String serialNumber;
    private LocalDate purchaseDate;
    private Double purchaseValue;
    private String location; // e.g., Room 101, Lab A
    private String status; // ACTIVE, DISPOSED, UNDER_MAINTENANCE
    private String tenantId;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}

