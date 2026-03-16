package com.ims.finance.service.impl;

import com.ims.finance.dto.FeeInstallmentPlanRequest;
import com.ims.finance.dto.FeeInstallmentPlanResponse;
import com.ims.finance.dto.FeeInstallmentScheduleRequest;
import com.ims.finance.dto.FeeInstallmentScheduleResponse;
import com.ims.finance.entity.FeeHead;
import com.ims.finance.entity.FeeInstallmentPlan;
import com.ims.finance.entity.FeeInstallmentSchedule;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.FeeHeadRepository;
import com.ims.finance.repository.FeeInstallmentPlanRepository;
import com.ims.finance.repository.FeeInstallmentScheduleRepository;
import com.ims.finance.service.FeeInstallmentPlanService;
import com.ims.finance.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeInstallmentPlanServiceImpl implements FeeInstallmentPlanService {

    private final FeeInstallmentPlanRepository planRepository;
    private final FeeInstallmentScheduleRepository scheduleRepository;
    private final FeeHeadRepository feeHeadRepository;

    @Override
    @Transactional
    public FeeInstallmentPlanResponse createPlan(FeeInstallmentPlanRequest request) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        FeeInstallmentPlan plan = new FeeInstallmentPlan();
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setOfferingId(request.getOfferingId());
        plan.setAcademicYear(request.getAcademicYear());
        plan.setTenantId(tenantId);

        plan = planRepository.save(plan);
        return mapToResponse(plan);
    }

    @Override
    public List<FeeInstallmentPlanResponse> getPlansByOffering(String offeringId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        List<FeeInstallmentPlan> plans = planRepository.findByOfferingIdAndTenantId(offeringId, tenantId);
        return plans.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public FeeInstallmentPlanResponse getPlanById(String planId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        FeeInstallmentPlan plan = planRepository.findById(planId)
                .filter(p -> p.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Installment Plan", planId));
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public FeeInstallmentPlanResponse addSchedulesToPlan(String planId, List<FeeInstallmentScheduleRequest> requests) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        FeeInstallmentPlan plan = planRepository.findById(planId)
                .filter(p -> p.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Installment Plan", planId));

        // Clear existing schedules for this plan
        scheduleRepository.deleteByPlanIdAndTenantId(planId, tenantId);

        // Add new schedules
        List<FeeInstallmentSchedule> schedules = requests.stream().map(req -> {
            FeeInstallmentSchedule schedule = new FeeInstallmentSchedule();
            schedule.setPlanId(planId);
            schedule.setFeeHeadId(req.getFeeHeadId());
            schedule.setInstallmentNumber(req.getInstallmentNumber());
            schedule.setAmount(req.getAmount());
            schedule.setDueDate(req.getDueDate());
            schedule.setTenantId(tenantId);
            return schedule;
        }).collect(Collectors.toList());

        scheduleRepository.saveAll(schedules);

        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public void deletePlan(String planId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        FeeInstallmentPlan plan = planRepository.findById(planId)
                .filter(p -> p.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Installment Plan", planId));

        scheduleRepository.deleteByPlanIdAndTenantId(planId, tenantId);
        planRepository.delete(plan);
    }

    private FeeInstallmentPlanResponse mapToResponse(FeeInstallmentPlan plan) {
        List<FeeInstallmentSchedule> schedules = scheduleRepository.findByPlanIdAndTenantIdOrderByInstallmentNumberAsc(plan.getId(), plan.getTenantId());
        
        List<FeeInstallmentScheduleResponse> scheduleResponses = schedules.stream().map(schedule -> {
            String feeHeadName = feeHeadRepository.findById(schedule.getFeeHeadId())
                    .map(FeeHead::getName)
                    .orElse("Unknown Fee Head");

            return FeeInstallmentScheduleResponse.builder()
                    .id(schedule.getId())
                    .feeHeadId(schedule.getFeeHeadId())
                    .feeHeadName(feeHeadName)
                    .installmentNumber(schedule.getInstallmentNumber())
                    .amount(schedule.getAmount())
                    .dueDate(schedule.getDueDate())
                    .build();
        }).collect(Collectors.toList());

        return FeeInstallmentPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .offeringId(plan.getOfferingId())
                .academicYear(plan.getAcademicYear())
                .schedules(scheduleResponses)
                .build();
    }
}
