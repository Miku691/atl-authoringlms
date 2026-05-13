package com.ims.staff.repo;

import com.ims.staff.entity.ImsStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ImsStaffRepo extends JpaRepository<ImsStaff, String> {

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
    boolean existsByEmployeeIdAndTenantId(String employeeId, String tenantId);

    List<ImsStaff> findByTenantId(String tenantId);

    Page<ImsStaff> findByTenantId(String tenantId, Pageable pageable);
}
