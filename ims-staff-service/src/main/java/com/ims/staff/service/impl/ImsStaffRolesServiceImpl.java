package com.ims.staff.service.impl;

import com.ims.staff.dto.ImsStaffRolesDto;
import com.ims.staff.entity.ImsStaff;
import com.ims.staff.entity.ImsStaffRoles;
import com.ims.staff.exception.ResourceAlreadyExistException;
import com.ims.staff.exception.ResourceNotFoundException;
import com.ims.staff.repo.ImsStaffRepo;
import com.ims.staff.repo.ImsStaffRolesRepo;
import com.ims.staff.service.ImsStaffRolesService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStaffRolesServiceImpl implements ImsStaffRolesService {

    private final ImsStaffRolesRepo repo;
    private final ImsStaffRepo staffRepo;
    private final ModelMapper modelMapper;

    private ImsStaffRolesDto toDto(ImsStaffRoles entity) {
        return modelMapper.map(entity, ImsStaffRolesDto.class);
    }

    @Override
    public ImsStaffRolesDto assignRole(ImsStaffRolesDto dto) {

        // Validate staff existence
        ImsStaff staff = staffRepo.findById(dto.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", dto.getStaffId()));

        // Avoid duplicate role assignment
        if (repo.existsByStaffIdAndRoleName(dto.getStaffId(), dto.getRoleName())) {
            throw new ResourceAlreadyExistException(
                    dto.getRoleName().name(),
                    "STAFF_ROLE",
                    "Role"
            );
        }

        ImsStaffRoles saved = repo.save(
                modelMapper.map(dto, ImsStaffRoles.class)
        );

        return toDto(saved);
    }

    @Override
    public List<ImsStaffRolesDto> getRolesByStaff(String staffId) {

        // Validate staff existence
        staffRepo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", staffId));

        return repo.findByStaffId(staffId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void removeRole(String roleId) {

        if (!repo.existsById(roleId)) {
            throw new ResourceNotFoundException("Staff Role ID", roleId);
        }

        repo.deleteById(roleId);
    }
}
