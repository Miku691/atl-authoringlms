package com.ims.staff.repo;

import com.ims.staff.entity.ImsStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStaffRepo extends JpaRepository<ImsStaff, String> {

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
    boolean existsByEmployeeId(String employeeId);

    List<ImsStaff> findByTenantId(String tenantId);
}
