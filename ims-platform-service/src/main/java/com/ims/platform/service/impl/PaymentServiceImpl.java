package com.ims.platform.service.impl;

import com.ims.platform.dto.PaymentOrderDto;
import com.ims.platform.dto.PaymentVerificationDto;
import com.ims.platform.entity.ImsSubscriptionPlans;
import com.ims.platform.entity.ImsTenantPayments;
import com.ims.platform.entity.ImsTenantSubscriptions;
import com.ims.platform.repo.SubscriptionPlansRepo;
import com.ims.platform.repo.TenantPaymentsRepo;
import com.ims.platform.repo.TenantSubscriptionsRepo;
import com.ims.platform.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @Value("${atl.razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${atl.razorpay.key.secret}")
    private String razorpayKeySecret;

    private final SubscriptionPlansRepo plansRepo;
    private final TenantPaymentsRepo paymentsRepo;
    private final TenantSubscriptionsRepo subscriptionsRepo;
    private final org.modelmapper.ModelMapper modelMapper;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws Exception {
        this.client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    @Override
    public java.util.List<com.ims.platform.dto.ImsTenantPaymentsDto> getTenantPayments(String tenantId) {
        return paymentsRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(payment -> {
                    com.ims.platform.dto.ImsTenantPaymentsDto dto = modelMapper.map(payment, com.ims.platform.dto.ImsTenantPaymentsDto.class);
                    dto.setPlanName(payment.getPlan().getName());
                    dto.setPlanId(payment.getPlan().getId());
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentOrderDto createOrder(PaymentOrderDto request) throws Exception {
        ImsSubscriptionPlans plan = plansRepo.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Determine amount based on billing cycle
        BigDecimal amount = plan.getPriceMonthly();
        if ("YEARLY".equalsIgnoreCase(request.getBillingCycle())) {
            amount = plan.getPriceYearly();
        }
        
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue()); // Paisa
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = client.orders.create(orderRequest);
        
        // Log pending payment
        ImsTenantPayments payment = new ImsTenantPayments();
        payment.setTenantId(request.getTenantId());
        payment.setPlan(plan);
        payment.setAmount(amount);
        payment.setRazorpayOrderId(order.get("id"));
        payment.setStatus("PENDING");
        payment.setBillingCycle(request.getBillingCycle());
        paymentsRepo.save(payment);

        request.setOrderId(order.get("id"));
        request.setAmount(amount);
        request.setCurrency("INR");
        request.setKeyId(razorpayKeyId); // Send public key to frontend
        
        return request;
    }

    @Override
    @Transactional
    public boolean verifyPayment(PaymentVerificationDto verification) throws Exception {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", verification.getRazorpayOrderId());
        options.put("razorpay_payment_id", verification.getRazorpayPaymentId());
        options.put("razorpay_signature", verification.getRazorpaySignature());

        boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

        if (isValid) {
            ImsTenantPayments payment = paymentsRepo.findByRazorpayOrderId(verification.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment record not found for order id: " + verification.getRazorpayOrderId()));

            payment.setRazorpayPaymentId(verification.getRazorpayPaymentId());
            payment.setRazorpaySignature(verification.getRazorpaySignature());
            payment.setStatus("SUCCESS");
            paymentsRepo.save(payment);

            // Provision subscription
            provisionSubscription(verification.getTenantId(), payment.getPlan(), verification.getBillingCycle());
            return true;
        }
        
        return false;
    }

    private void provisionSubscription(String tenantId, ImsSubscriptionPlans plan, String billingCycle) {
        ImsTenantSubscriptions sub = subscriptionsRepo.findByTenantId(tenantId)
                .orElse(new ImsTenantSubscriptions());
        
        sub.setTenantId(tenantId);
        sub.setPlan(plan);
        sub.setStatus("ACTIVE");
        
        int monthsToAdd = "YEARLY".equalsIgnoreCase(billingCycle) ? 12 : 1;
        sub.setValidUntil(LocalDateTime.now().plusMonths(monthsToAdd));
        
        subscriptionsRepo.save(sub);
    }
}
