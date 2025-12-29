package com.ims.instructor.repo;


import com.ims.instructor.entity.ImsInstructors;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ImsInstructorsRepo extends JpaRepository<ImsInstructors, String> {
    boolean existsByUserId(String userId);
    List<ImsInstructors> findByTenantId(String tenantId);
}
