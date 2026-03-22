package com.ims.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    private String id;
    private String name;
    private String categoryId;
    private String categoryName;
    private String description;
    private String unit;
    private Double currentStock;
    private Double reorderLevel;
}
