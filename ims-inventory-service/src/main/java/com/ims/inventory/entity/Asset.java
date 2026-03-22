package com.ims.inventory.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String name;
    private String categoryId;
    private String serialNumber;
    private LocalDate purchaseDate;
    private Double purchaseValue;
    private String location; // e.g., Room 101, Lab A
    private String status; // ACTIVE, DISPOSED, UNDER_MAINTENANCE
    private String tenantId;
}
