package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsBranchesDto;
import com.ims.academic.entity.ImsBranches;
import com.ims.academic.repository.ImsBranchesRepository;
import com.ims.academic.service.ImsBranchesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsBranchesServiceImpl implements ImsBranchesService {

    private final ImsBranchesRepository repository;

    @Override
    public ImsBranchesDto create(ImsBranchesDto dto) {
        ImsBranches entity = ImsBranches.builder()
                .tenantId(dto.getTenantId())
                .programId(dto.getProgramId())
                .name(dto.getName())
                .code(dto.getCode())
                .build();
        entity = repository.save(entity);
        dto.setId(entity.getId());
        return dto;
    }

    @Override
    public List<ImsBranchesDto> getByTenantId(String tenantId) {
        return repository.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsBranchesDto> getByProgramId(String tenantId, String programId) {
        return repository.findByTenantIdAndProgramId(tenantId, programId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ImsBranchesDto toDto(ImsBranches entity) {
        return ImsBranchesDto.builder()
                .id(entity.getId())
                .tenantId(entity.getTenantId())
                .programId(entity.getProgramId())
                .name(entity.getName())
                .code(entity.getCode())
                .build();
    }
}
