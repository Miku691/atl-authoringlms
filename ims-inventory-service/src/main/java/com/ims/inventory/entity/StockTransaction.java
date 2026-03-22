package com.ims.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransaction {
    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String itemId;
    private String supplierId; // Null for internal usage
    private Double quantity;
    @Enumerated(EnumType.STRING)
    private TransactionType type; // IN, OUT
    private Double unitPrice; // Optional for OUT
    private Double totalPrice; // Optional for OUT
    private String referenceNumber; // Invoice/Order number
    private LocalDateTime transactionDate;
    private String remarks;
    private String tenantId;

    public enum TransactionType {
        IN, OUT
    }
}
