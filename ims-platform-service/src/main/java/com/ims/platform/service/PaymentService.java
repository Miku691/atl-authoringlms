package com.ims.platform.service;

import com.ims.platform.dto.PaymentOrderDto;
import com.ims.platform.dto.PaymentVerificationDto;

import com.ims.platform.dto.ImsTenantPaymentsDto;
import java.util.List;

public interface PaymentService {
    PaymentOrderDto createOrder(PaymentOrderDto requestDto) throws Exception;
    boolean verifyPayment(PaymentVerificationDto verificationDto) throws Exception;
    List<ImsTenantPaymentsDto> getTenantPayments(String tenantId);
}
