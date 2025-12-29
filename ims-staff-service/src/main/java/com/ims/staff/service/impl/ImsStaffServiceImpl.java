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

        if (repo.existsByUserId(dto.getUserId())) {
            throw new ResourceAlreadyExistException(dto.getUserId(), "STAFF", "User ID");
        }

        if (repo.existsByContactNumber(dto.getContactNumber())) {
            throw new ResourceAlreadyExistException(dto.getContactNumber(), "STAFF", "Contact Number");
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

        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setRelationType(dto.getRelationType());
        existing.setStatus(dto.getStatus());

        if (dto.getContactNumber() != null &&
                !dto.getContactNumber().equals(existing.getContactNumber()) &&
                repo.existsByContactNumber(dto.getContactNumber())) {
            throw new ResourceAlreadyExistException(dto.getContactNumber(), "STAFF", "Contact Number");
        }

        if (dto.getEmail() != null &&
                !dto.getEmail().equals(existing.getEmail()) &&
                repo.existsByEmail(dto.getEmail())) {
            throw new ResourceAlreadyExistException(dto.getEmail(), "STAFF", "Email");
        }

        existing.setContactNumber(dto.getContactNumber());
        existing.setEmail(dto.getEmail());

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