package com.ims.platform.repo;

import com.ims.platform.entity.ImsSubscriptionPlans;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPlansRepo extends JpaRepository<ImsSubscriptionPlans, String> {
    List<ImsSubscriptionPlans> findByIsActiveTrue();
    Optional<ImsSubscriptionPlans> findByName(String name);
}
