package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsYearsDto;
import com.ims.academic.entity.ImsYears;
import com.ims.academic.repository.ImsYearsRepository;
import com.ims.academic.service.ImsYearsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsYearsServiceImpl implements ImsYearsService {

    private final ImsYearsRepository repository;

    @Override
    public ImsYearsDto create(ImsYearsDto dto) {
        ImsYears entity = ImsYears.builder()
                .tenantId(dto.getTenantId())
                .branchId(dto.getBranchId())
                .name(dto.getName())
                .yearNumber(dto.getYearNumber())
                .build();
        entity = repository.save(entity);
        dto.setId(entity.getId());
        return dto;
    }

    @Override
    public List<ImsYearsDto> getByTenantId(String tenantId) {
        return repository.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsYearsDto> getByBranchId(String tenantId, String branchId) {
        return repository.findByTenantIdAndBranchId(tenantId, branchId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ImsYearsDto toDto(ImsYears entity) {
        return ImsYearsDto.builder()
                .id(entity.getId())
                .tenantId(entity.getTenantId())
                .branchId(entity.getBranchId())
                .name(entity.getName())
                .yearNumber(entity.getYearNumber())
                .build();
    }
}
