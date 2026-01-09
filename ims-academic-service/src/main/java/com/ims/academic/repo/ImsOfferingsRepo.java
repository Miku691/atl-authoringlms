package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsOfferingsRepo extends JpaRepository<ImsOfferings, String> {

    List<ImsOfferings> findByTenantId(String tenantId);

    List<ImsOfferings> findByProgramId(String programId);

    long countByTenantId(String tenantId);
}
