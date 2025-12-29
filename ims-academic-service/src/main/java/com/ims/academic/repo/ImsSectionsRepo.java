package com.ims.academic.repo;

import com.ims.academic.entity.ImsSections;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsSectionsRepo extends JpaRepository<ImsSections, String> {

    boolean existsByImsClassIdAndName(String classId, String name);

    List<ImsSections> findByTenantId(String tenantId);

    List<ImsSections> findByImsClassId(String classId);
}
