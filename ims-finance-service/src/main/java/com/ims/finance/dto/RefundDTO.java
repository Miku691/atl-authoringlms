package com.ims.finance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundDTO {
    private String id;

    @NotBlank(message = "Student ID is mandatory")
    private String studentId;

    @NotBlank(message = "Fee record ID is mandatory")
    private String studentFeeRecordId;

    @NotNull(message = "Refund amount is mandatory")
    @Min(value = 1, message = "Refund amount must be at least 1")
    private java.math.BigDecimal amount;

    @NotBlank(message = "Refund mode is mandatory")
    private String refundMode;

    private String reason;
    private LocalDateTime refundDate;
    private String processedBy;
    private String tenantId;
}
