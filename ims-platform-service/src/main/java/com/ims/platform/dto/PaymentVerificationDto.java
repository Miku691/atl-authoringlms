package com.ims.platform.dto;

import lombok.Data;

@Data
public class PaymentVerificationDto {
    private String tenantId;
    private String planId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String billingCycle;
}
