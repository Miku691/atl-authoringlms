package com.ims.student.repo;

import com.ims.student.entity.ImsMasterDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ImsMasterDocumentType access.
 */
@Repository
public interface ImsMasterDocumentTypeRepo extends JpaRepository<ImsMasterDocumentType, String> {
    /**
     * Find all document types that are either global (null tenantId) or belong to a specific tenant.
     *
     * @param tenantId the id of the current tenant
     * @return list of matching document types
     */
    List<ImsMasterDocumentType> findByTenantId(String tenantId);
}
