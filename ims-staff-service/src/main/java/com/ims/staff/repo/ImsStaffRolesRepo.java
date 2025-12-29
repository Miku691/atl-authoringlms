package com.ims.staff.repo;

import com.ims.staff.entity.ImsStaffRoles;
import com.ims.staff.enums.StaffRoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStaffRolesRepo extends JpaRepository<ImsStaffRoles, String> {

    boolean existsByStaffIdAndRoleName(String staffId, StaffRoleType roleName);

    List<ImsStaffRoles> findByStaffId(String staffId);
}
