package com.ims.student.repo;

import com.ims.student.entity.ImsGuardians;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface ImsGuardiansRepo extends JpaRepository<ImsGuardians, String> {
    Optional<ImsGuardians> findByPhone(String phone);

    Optional<ImsGuardians> findByPhoneAndTenantId(String phone, String tenantId);

    Optional<ImsGuardians> findByEmailAndTenantId(String email, String tenantId);

    java.util.List<ImsGuardians> findByTenantId(String tenantId);

    Page<ImsGuardians> findByTenantId(String tenantId, Pageable pageable);
}
