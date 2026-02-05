package com.ims.academic.service.impl;

import com.ims.academic.dto.DepartmentDto;
import com.ims.academic.entity.Department;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.DepartmentRepo;
import com.ims.academic.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public DepartmentDto create(DepartmentDto dto) {
        Department entity = modelMapper.map(dto, Department.class);
        return toDto(repo.save(entity));
    }

    @Override
    public DepartmentDto update(String id, DepartmentDto dto) {
        Department existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department ID", id));

        if (dto.getName() != null)
            existing.setName(dto.getName());
        if (dto.getCode() != null)
            existing.setCode(dto.getCode());
        if (dto.getHeadOfDepartmentId() != null)
            existing.setHeadOfDepartmentId(dto.getHeadOfDepartmentId());

        return toDto(repo.save(existing));
    }

    @Override
    public DepartmentDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Department ID", id));
    }

    @Override
    public List<DepartmentDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Department ID", id);
        }
        repo.deleteById(id);
    }

    private DepartmentDto toDto(Department entity) {
        return modelMapper.map(entity, DepartmentDto.class);
    }
}
