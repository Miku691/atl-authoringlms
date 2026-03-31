package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructors;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ImsInstructorsRepo extends JpaRepository<ImsInstructors, String> {
    boolean existsByUserId(String userId);
    boolean existsByEmployeeId(String employeeId);

    Optional<ImsInstructors> findByUserId(String userId);

    Optional<ImsInstructors> findByEmailAndTenantId(String email, String tenantId);

    List<ImsInstructors> findByTenantId(String tenantId);

    long countByTenantId(String tenantId);
}
