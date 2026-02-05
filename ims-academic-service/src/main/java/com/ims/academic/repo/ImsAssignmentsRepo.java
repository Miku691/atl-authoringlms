package com.ims.academic.repo;

import com.ims.academic.entity.ImsAssignments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsAssignmentsRepo extends JpaRepository<ImsAssignments, String> {
    List<ImsAssignments> findByTenantId(String tenantId);

    List<ImsAssignments> findByTenantIdAndOfferingId(String tenantId, String offeringId);
}
