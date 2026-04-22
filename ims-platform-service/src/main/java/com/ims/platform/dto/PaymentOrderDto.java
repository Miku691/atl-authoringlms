package com.ims.platform.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentOrderDto {
    private String tenantId;
    private String planId;
    private BigDecimal amount;
    private String currency;
    private String orderId; // Razorpay Order ID
    private String keyId;   // Razorpay Public Key ID
    private String billingCycle; // MONTHLY or YEARLY
}
