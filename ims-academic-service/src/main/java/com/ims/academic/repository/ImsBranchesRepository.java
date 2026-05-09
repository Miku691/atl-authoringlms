package com.ims.academic.repository;

import com.ims.academic.entity.ImsBranches;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsBranchesRepository extends JpaRepository<ImsBranches, String> {
    List<ImsBranches> findByTenantId(String tenantId);
    List<ImsBranches> findByTenantIdAndProgramId(String tenantId, String programId);
}
