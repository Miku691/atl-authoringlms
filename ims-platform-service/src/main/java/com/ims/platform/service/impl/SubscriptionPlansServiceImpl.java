package com.ims.platform.service.impl;

import com.ims.platform.dto.ImsSubscriptionPlansDto;
import com.ims.platform.entity.ImsSubscriptionPlans;
import com.ims.platform.repo.SubscriptionPlansRepo;
import com.ims.platform.service.SubscriptionPlansService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionPlansServiceImpl implements SubscriptionPlansService {

    private final SubscriptionPlansRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public ImsSubscriptionPlansDto createPlan(ImsSubscriptionPlansDto dto) {
        ImsSubscriptionPlans plan = modelMapper.map(dto, ImsSubscriptionPlans.class);
        ImsSubscriptionPlans saved = repo.save(plan);
        return modelMapper.map(saved, ImsSubscriptionPlansDto.class);
    }

    @Override
    public ImsSubscriptionPlansDto updatePlan(String id, ImsSubscriptionPlansDto dto) {
        ImsSubscriptionPlans existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
        
        modelMapper.map(dto, existing);
        existing.setId(id); // Ensure ID is preserved
        ImsSubscriptionPlans updated = repo.save(existing);
        return modelMapper.map(updated, ImsSubscriptionPlansDto.class);
    }

    @Override
    public List<ImsSubscriptionPlansDto> getAllPlans(boolean activeOnly) {
        List<ImsSubscriptionPlans> plans;
        if (activeOnly) {
            plans = repo.findByIsActiveTrue();
        } else {
            plans = repo.findAll();
        }
        return plans.stream()
                .map(p -> modelMapper.map(p, ImsSubscriptionPlansDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ImsSubscriptionPlansDto getPlanById(String id) {
        ImsSubscriptionPlans plan = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
        return modelMapper.map(plan, ImsSubscriptionPlansDto.class);
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultPlans() {
        // 1. Starter (FREE)
        if (repo.findAll().stream().noneMatch(p -> p.getName().equalsIgnoreCase("Starter (FREE)"))) {
            ImsSubscriptionPlans starter = new ImsSubscriptionPlans();
            starter.setName("Starter (FREE)");
            starter.setDescription("Perfect for small institutions getting started.");
            starter.setPriceMonthly(new java.math.BigDecimal("0"));
            starter.setPriceYearly(new java.math.BigDecimal("0"));
            starter.setMaxStudents(10);
            starter.setMaxTeachers(2);
            starter.setMaxStaff(1);
            starter.setMaxGuardians(1);
            starter.setFeaturesList("[\"Basic Student Management\", \"Manual Attendance\", \"Basic Reports\"]");
            starter.setIsActive(true);
            repo.save(starter);
        }

        // 2. Professional (PRO)
        if (repo.findAll().stream().noneMatch(p -> p.getName().equalsIgnoreCase("Professional (PRO)"))) {
            ImsSubscriptionPlans pro = new ImsSubscriptionPlans();
            pro.setName("Professional (PRO)");
            pro.setDescription("Full academic and operational control for growing institutes.");
            pro.setPriceMonthly(new java.math.BigDecimal("1999"));
            pro.setPriceYearly(new java.math.BigDecimal("19999"));
            pro.setMaxStudents(1000);
            pro.setMaxTeachers(50);
            pro.setMaxStaff(20);
            pro.setMaxGuardians(500);
            pro.setFeaturesList("[\"Advanced LMS Integration\", \"AI Attendance Tracking\", \"Custom Branding\", \"Priority Support\"]");
            pro.setIsActive(true);
            repo.save(pro);
        }

        // 3. Enterprise
        if (repo.findAll().stream().noneMatch(p -> p.getName().equalsIgnoreCase("Enterprise"))) {
            ImsSubscriptionPlans enterprise = new ImsSubscriptionPlans();
            enterprise.setName("Enterprise");
            enterprise.setDescription("Customizable solutions for large scale education networks.");
            enterprise.setPriceMonthly(new java.math.BigDecimal("4999"));
            enterprise.setPriceYearly(new java.math.BigDecimal("49999"));
            enterprise.setMaxStudents(10000);
            enterprise.setMaxTeachers(200);
            enterprise.setMaxStaff(100);
            enterprise.setMaxGuardians(5000);
            enterprise.setFeaturesList("[\"Unlimited Growth\", \"API Access\", \"Dedicated Account Manager\", \"White-label Mobile App\"]");
            enterprise.setIsActive(true);
            repo.save(enterprise);
        }
    }
}
