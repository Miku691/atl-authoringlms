package com.ims.staff.service.impl;

import com.ims.staff.dto.ImsStaffDto;
import com.ims.staff.entity.ImsStaff;
import com.ims.staff.exception.ResourceAlreadyExistException;
import com.ims.staff.exception.ResourceNotFoundException;
import com.ims.staff.repo.ImsStaffRepo;
import com.ims.staff.service.ImsStaffService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStaffServiceImpl implements ImsStaffService {

    private final ImsStaffRepo repo;
    private final ModelMapper modelMapper;

    private ImsStaffDto toDto(ImsStaff staff) {
        return modelMapper.map(staff, ImsStaffDto.class);
    }

    private ImsStaff toEntity(ImsStaffDto dto) {
        return modelMapper.map(dto, ImsStaff.class);
    }

    @Override
    public ImsStaffDto create(ImsStaffDto dto) {

        if (repo.existsByPhone(dto.getPhone())) {
            throw new ResourceAlreadyExistException(dto.getPhone(), "STAFF", "Phone Number");
        }

        if (dto.getEmail() != null && repo.existsByEmail(dto.getEmail())) {
            throw new ResourceAlreadyExistException(dto.getEmail(), "STAFF", "Email");
        }

        ImsStaff saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsStaffDto update(String id, ImsStaffDto dto) {

        ImsStaff existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", id));

        if (dto.getFirstName() != null)
            existing.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null)
            existing.setLastName(dto.getLastName());
        if (dto.getStatus() != null)
            existing.setStatus(dto.getStatus());

        if (dto.getPhone() != null &&
                !dto.getPhone().equals(existing.getPhone())) {
            if (repo.existsByPhone(dto.getPhone())) {
                throw new ResourceAlreadyExistException(dto.getPhone(), "STAFF", "Phone Number");
            }
            existing.setPhone(dto.getPhone());
        }

        if (dto.getEmail() != null &&
                !dto.getEmail().equals(existing.getEmail())) {
            if (repo.existsByEmail(dto.getEmail())) {
                throw new ResourceAlreadyExistException(dto.getEmail(), "STAFF", "Email");
            }
            existing.setEmail(dto.getEmail());
        }

        // Broad profile fields
        if (dto.getEmployeeId() != null)
            existing.setEmployeeId(dto.getEmployeeId());
        if (dto.getJoinDate() != null)
            existing.setJoinDate(dto.getJoinDate());
        if (dto.getDob() != null)
            existing.setDob(dto.getDob());
        if (dto.getGender() != null)
            existing.setGender(dto.getGender());
        if (dto.getAddress() != null)
            existing.setAddress(dto.getAddress());
        if (dto.getRole() != null)
            existing.setRole(dto.getRole());
        if (dto.getDepartment() != null)
            existing.setDepartment(dto.getDepartment());
        if (dto.getMonthlySalary() != null)
            existing.setMonthlySalary(dto.getMonthlySalary());
        if (dto.getQualification() != null)
            existing.setQualification(dto.getQualification());
        if (dto.getExperience() != null)
            existing.setExperience(dto.getExperience());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsStaffDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", id));
    }

    @Override
    public List<ImsStaffDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsStaffDto> getAll() {
        return repo.findAll()
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Staff ID", id);
        }
        repo.deleteById(id);
    }
}