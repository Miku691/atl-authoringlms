package com.ims.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Data Transfer Object for FeeDiscount.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeDiscountDTO {

    private String id;

    @NotBlank(message = "Discount name is mandatory")
    private String name;

    @NotBlank(message = "Discount type is mandatory (PERCENTAGE/FIXED)")
    private String type;

    @NotNull(message = "Value is mandatory")
    @Positive(message = "Value must be positive")
    private BigDecimal value;

    private String tenantId;
}
