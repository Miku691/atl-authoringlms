package com.ims.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionDTO {
    private String id;
    private String itemId;
    private String itemName;
    private String supplierId;
    private String supplierName;
    private Double quantity;
    private String type;
    private Double unitPrice;
    private Double totalPrice;
    private String referenceNumber;
    private LocalDateTime transactionDate;
    private String remarks;
}
