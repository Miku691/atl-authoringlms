package com.ims.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Data Transfer Object for FeeStructure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureDTO {

    private String id;

    @NotBlank(message = "Fee head ID is mandatory")
    private String feeHeadId;

    @NotBlank(message = "Offering ID is mandatory")
    private String offeringId;

    @NotNull(message = "Amount is mandatory")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Academic year is mandatory")
    private String academicYear;

    private String tenantId;
}
