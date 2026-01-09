package com.ims.academic.repo;

import com.ims.academic.entity.ImsTimetableMasters;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsTimetableMastersRepo extends JpaRepository<ImsTimetableMasters, String> {
    List<ImsTimetableMasters> findByOfferingId(String offeringId);
}
