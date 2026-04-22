package com.ims.platform.service;

import com.ims.platform.dto.ImsSubscriptionPlansDto;
import java.util.List;

public interface SubscriptionPlansService {
    ImsSubscriptionPlansDto createPlan(ImsSubscriptionPlansDto dto);
    ImsSubscriptionPlansDto updatePlan(String id, ImsSubscriptionPlansDto dto);
    List<ImsSubscriptionPlansDto> getAllPlans(boolean activeOnly);
    ImsSubscriptionPlansDto getPlanById(String id);

    void seedDefaultPlans();
}
