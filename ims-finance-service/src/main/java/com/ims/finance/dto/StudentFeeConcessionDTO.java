package com.ims.finance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeConcessionDTO {

    private String id;

    @NotBlank(message = "Student ID is mandatory")
    private String studentId;

    @NotBlank(message = "Fee Discount ID is mandatory")
    private String feeDiscountId;

    @NotBlank(message = "Academic Year is mandatory")
    private String academicYear;

    private String tenantId;
    
    private String status;

    private String remarks;
}
