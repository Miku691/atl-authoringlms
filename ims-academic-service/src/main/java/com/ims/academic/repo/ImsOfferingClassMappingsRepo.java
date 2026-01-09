package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferingClassMappings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsOfferingClassMappingsRepo extends JpaRepository<ImsOfferingClassMappings, String> {
    List<ImsOfferingClassMappings> findByOfferingId(String offeringId);

    List<ImsOfferingClassMappings> findByClassId(String classId);
}
