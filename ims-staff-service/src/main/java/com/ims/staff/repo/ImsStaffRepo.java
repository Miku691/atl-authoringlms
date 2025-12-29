package com.ims.staff.repo;

import com.ims.staff.entity.ImsStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStaffRepo extends JpaRepository<ImsStaff, String> {

    boolean existsByUserId(String userId);

    boolean existsByContactNumber(String contactNumber);

    boolean existsByEmail(String email);

    List<ImsStaff> findByTenantId(String tenantId);
}
