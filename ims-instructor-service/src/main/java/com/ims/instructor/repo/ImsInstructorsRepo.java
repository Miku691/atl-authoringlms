package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructors;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;

public interface ImsInstructorsRepo extends JpaRepository<ImsInstructors, String> {
    boolean existsByUserId(String userId);
    boolean existsByEmployeeId(String employeeId);

    Optional<ImsInstructors> findByUserId(String userId);

    Optional<ImsInstructors> findByEmailAndTenantId(String email, String tenantId);

    List<ImsInstructors> findByTenantId(String tenantId);

    Page<ImsInstructors> findByTenantId(String tenantId, Pageable pageable);

    long countByTenantId(String tenantId);
}
