package com.ims.academic.repo;

import com.ims.academic.entity.ImsExamMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsExamMasterRepo extends JpaRepository<ImsExamMaster, String> {

    List<ImsExamMaster> findByTenantIdAndAcademicSessionIdOrderByExamName(String tenantId, String sessionId);

    List<ImsExamMaster> findByTenantIdAndIsPublished(String tenantId, boolean isPublished);
}
