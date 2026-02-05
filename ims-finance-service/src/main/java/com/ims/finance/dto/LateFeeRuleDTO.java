package com.ims.finance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LateFeeRuleDTO {
    private String id;

    @NotBlank(message = "Rule name is mandatory")
    private String name;

    @NotBlank(message = "Rule type (FIXED/PERCENTAGE) is mandatory")
    private String type;

    @NotNull(message = "Penalty value is mandatory")
    @Min(value = 0, message = "Penalty value must be positive")
    private java.math.BigDecimal value;

    @NotNull(message = "Grace period is mandatory")
    @Min(value = 0, message = "Grace period cannot be negative")
    private Integer gracePeriodDays;

    private String tenantId;
}
