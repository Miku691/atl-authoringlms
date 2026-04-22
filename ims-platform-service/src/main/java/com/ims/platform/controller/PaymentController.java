package com.ims.platform.controller;

import com.ims.platform.dto.PaymentOrderDto;
import com.ims.platform.dto.PaymentVerificationDto;
import com.ims.platform.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/platform/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderDto> createOrder(@RequestBody PaymentOrderDto request) throws Exception {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyPayment(@RequestBody PaymentVerificationDto verification) throws Exception {
        boolean result = paymentService.verifyPayment(verification);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history/{tenantId}")
    public ResponseEntity<java.util.List<com.ims.platform.dto.ImsTenantPaymentsDto>> getPaymentHistory(@PathVariable String tenantId) {
        return ResponseEntity.ok(paymentService.getTenantPayments(tenantId));
    }
}
