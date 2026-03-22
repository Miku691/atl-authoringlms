package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    private String id;
    private String categoryId;
    private String categoryName;
    private BigDecimal allocatedAmount;
    private BigDecimal actualSpend; // Calculated field
    private String academicYear;
    private String tenantId;
}
