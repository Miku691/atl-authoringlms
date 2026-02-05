package com.ims.academic.repo;

import com.ims.academic.entity.ImsSubjects;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImsSubjectsRepo extends JpaRepository<ImsSubjects, String> {

    boolean existsByTenantIdAndCode(String tenantId, String code);

    boolean existsByTenantIdAndTitle(String tenantId, String title);

    java.util.List<ImsSubjects> findByTenantId(String tenantId);
}
