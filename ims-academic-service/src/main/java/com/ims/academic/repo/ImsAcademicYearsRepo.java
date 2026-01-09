package com.ims.academic.repo;

import com.ims.academic.entity.ImsAcademicYears;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsAcademicYearsRepo extends JpaRepository<ImsAcademicYears, String> {

    boolean existsByTenantIdAndLabel(String tenantId, String label);

    List<ImsAcademicYears> findByTenantId(String tenantId);

    long countByTenantId(String tenantId);
}
