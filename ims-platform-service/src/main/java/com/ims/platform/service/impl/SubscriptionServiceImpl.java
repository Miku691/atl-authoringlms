package com.ims.platform.service.impl;

import com.ims.platform.dto.ImsTenantSubscriptionsDto;
import com.ims.platform.entity.ImsSubscriptionPlans;
import com.ims.platform.entity.ImsTenantSubscriptions;
import com.ims.platform.repo.SubscriptionPlansRepo;
import com.ims.platform.repo.TenantSubscriptionsRepo;
import com.ims.platform.service.TenantSubscriptionsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements TenantSubscriptionsService {

    private final TenantSubscriptionsRepo tenantSubsRepo;
    private final SubscriptionPlansRepo plansRepo;
    private final ModelMapper modelMapper;

    @Override
    public ImsTenantSubscriptionsDto getTenantSubscription(String tenantId) {
        return tenantSubsRepo.findByTenantId(tenantId)
                .map(sub -> mapToDto(sub))
                .orElseGet(() -> {
                    // Fallback to Starter (FREE) plan if no sub found
                    return plansRepo.findAll().stream()
                            .filter(p -> p.getName().equalsIgnoreCase("Starter (FREE)"))
                            .findFirst()
                            .map(freePlan -> createDefaultFreeDto(tenantId, freePlan))
                            .orElseThrow(() -> new RuntimeException("Default 'Starter (FREE)' plan not configured in system seeding. Please ensure the system is properly initialized."));
                });
    }

    @Override
    public void createInitialSubscription(String tenantId, String planName) {
        ImsSubscriptionPlans plan = plansRepo.findByName(planName)
                .orElseThrow(() -> new RuntimeException("Plan not found: " + planName));

        ImsTenantSubscriptions sub = new ImsTenantSubscriptions();
        sub.setTenantId(tenantId);
        sub.setPlan(plan);
        sub.setStatus("ACTIVE");
        sub.setValidUntil(LocalDateTime.now().plusYears(1)); // Default 1 year for initial free/provisioned
        
        tenantSubsRepo.save(sub);
    }

    private ImsTenantSubscriptionsDto mapToDto(ImsTenantSubscriptions sub) {
        ImsTenantSubscriptionsDto dto = modelMapper.map(sub, ImsTenantSubscriptionsDto.class);
        dto.setPlanName(sub.getPlan().getName());
        dto.setMaxStudents(sub.getPlan().getMaxStudents());
        dto.setMaxTeachers(sub.getPlan().getMaxTeachers());
        dto.setMaxStaff(sub.getPlan().getMaxStaff());
        dto.setMaxGuardians(sub.getPlan().getMaxGuardians());
        return dto;
    }

    private ImsTenantSubscriptionsDto createDefaultFreeDto(String tenantId, ImsSubscriptionPlans freePlan) {
        ImsTenantSubscriptionsDto dto = new ImsTenantSubscriptionsDto();
        dto.setTenantId(tenantId);
        dto.setPlanId(freePlan.getId());
        dto.setPlanName(freePlan.getName());
        dto.setMaxStudents(freePlan.getMaxStudents());
        dto.setMaxTeachers(freePlan.getMaxTeachers());
        dto.setMaxStaff(freePlan.getMaxStaff());
        dto.setMaxGuardians(freePlan.getMaxGuardians());
        dto.setStatus("ACTIVE");
        return dto;
    }
}
