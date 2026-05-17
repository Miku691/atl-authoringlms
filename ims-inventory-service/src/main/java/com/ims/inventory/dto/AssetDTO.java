package com.ims.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDTO {
    private String id;
    private String name;
    private String categoryId;
    private String categoryName;
    private String itemId;
    private String serialNumber;
    private LocalDate purchaseDate;
    private Double purchaseValue;
    private String location;
    private String status;
}
