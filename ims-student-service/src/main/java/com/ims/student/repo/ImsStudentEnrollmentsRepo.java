package com.ims.student.repo;

import com.ims.student.entity.ImsStudentEnrollments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImsStudentEnrollmentsRepo extends JpaRepository<ImsStudentEnrollments, String> {
    List<ImsStudentEnrollments> findByStudentId(String studentId);

    List<ImsStudentEnrollments> findByTenantId(String tenantId);

    List<ImsStudentEnrollments> findByOfferingIdAndTenantId(String offeringId, String tenantId);

    Optional<ImsStudentEnrollments> findByStudentIdAndOfferingIdAndTenantId(String studentId, String offeringId,
            String tenantId);

    boolean existsByStudentIdAndOfferingIdAndStatusAndTenantId(String studentId, String offeringId, String status,
            String tenantId);

    org.springframework.data.domain.Page<ImsStudentEnrollments> findByOfferingIdAndStatusAndTenantId(String offeringId,
            String status, String tenantId, org.springframework.data.domain.Pageable pageable);
}
