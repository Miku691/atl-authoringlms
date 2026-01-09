package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsAcademicYearsDto;
import com.ims.academic.entity.ImsAcademicYears;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAcademicYearsRepo;
import com.ims.academic.service.ImsAcademicYearsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAcademicYearsServiceImpl implements ImsAcademicYearsService {

    private final ImsAcademicYearsRepo repo;
    private final ModelMapper modelMapper;

    private ImsAcademicYearsDto toDto(ImsAcademicYears entity) {
        return modelMapper.map(entity, ImsAcademicYearsDto.class);
    }

    private ImsAcademicYears toEntity(ImsAcademicYearsDto dto) {
        return modelMapper.map(dto, ImsAcademicYears.class);
    }

    @Override
    public ImsAcademicYearsDto create(ImsAcademicYearsDto dto) {

        if (repo.existsByTenantIdAndLabel(dto.getTenantId(), dto.getLabel())) {
            throw new ResourceAlreadyExistException(
                    "Academic Year label already exists for this tenant", "ACADEMIC_YEAR", "TenantId_Label");
        }

        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsAcademicYearsDto update(String id, ImsAcademicYearsDto dto) {

        ImsAcademicYears existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicYear ID", id));

        if (!existing.getLabel().equals(dto.getLabel()) &&
                repo.existsByTenantIdAndLabel(existing.getTenantId(), dto.getLabel())) {
            throw new ResourceAlreadyExistException(
                    "Academic Year label already exists for this tenant", "ACADEMIC_YEAR", "TenantId_Label");
        }

        existing.setLabel(dto.getLabel());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsAcademicYearsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicYear ID", id));
    }

    @Override
    public List<ImsAcademicYearsDto> getByTenantId(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("AcademicYear ID", id);
        }
        repo.deleteById(id);
    }
}
