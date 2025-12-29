package com.ims.staff.service;

import com.ims.staff.dto.ImsStaffRolesDto;

import java.util.List;

public interface ImsStaffRolesService {
    ImsStaffRolesDto assignRole(ImsStaffRolesDto dto);
    List<ImsStaffRolesDto> getRolesByStaff(String staffId);
    void removeRole(String roleId);
}
