package com.ims.student.repo;

import com.ims.student.entity.ImsStudents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImsStudentsRepo extends JpaRepository<ImsStudents, String> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByAdmissionNo(String admissionNo);

    Optional<ImsStudents> findByEmail(String email);

    List<ImsStudents> findByTenantId(String tenantId);

    Optional<ImsStudents> findByUserId(String userId);

    Optional<ImsStudents> findByEmailAndTenantId(String email, String tenantId);

    long countByTenantId(String tenantId);
}
