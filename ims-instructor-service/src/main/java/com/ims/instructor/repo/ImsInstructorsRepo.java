package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructors;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;

public interface ImsInstructorsRepo extends JpaRepository<ImsInstructors, String> {
    boolean existsByUserId(String userId);
    boolean existsByEmployeeIdAndTenantId(String employeeId, String tenantId);

    Optional<ImsInstructors> findByUserId(String userId);

    Optional<ImsInstructors> findByEmailAndTenantId(String email, String tenantId);

    List<ImsInstructors> findByTenantId(String tenantId);

    Page<ImsInstructors> findByTenantId(String tenantId, Pageable pageable);

    long countByTenantId(String tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i) FROM ImsInstructors i WHERE i.tenantId = :tenantId AND MONTH(i.dob) = :month AND DAY(i.dob) = :day AND (i.status IS NULL OR i.status = 'ACTIVE' OR i.status = 'active')")
    long countTodayBirthdays(@org.springframework.data.repository.query.Param("tenantId") String tenantId, @org.springframework.data.repository.query.Param("month") int month, @org.springframework.data.repository.query.Param("day") int day);
}

