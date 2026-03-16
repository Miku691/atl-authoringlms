package com.ims.academic.repo;

import com.ims.academic.entity.AcademicSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicSessionRepo extends JpaRepository<AcademicSession, String> {
    List<AcademicSession> findByTenantId(String tenantId);

    List<AcademicSession> findByProgramId(String programId);

    java.util.Optional<AcademicSession> findFirstByTenantIdAndIsCurrentTrue(String tenantId);
}
