package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ImsOfferingsRepo extends JpaRepository<ImsOfferings, String> {

    List<ImsOfferings> findByTenantId(String tenantId);

    List<ImsOfferings> findBySession_ProgramId(String programId);

    List<ImsOfferings> findBySessionId(String sessionId);

    @Query("SELECT o FROM ImsOfferings o WHERE o.id IN (SELECT oi.offeringId FROM ImsOfferingInstructors oi WHERE oi.instructorId = :instructorId)")
    List<ImsOfferings> findByInstructorId(@Param("instructorId") String instructorId);

    long countByTenantId(String tenantId);
}
