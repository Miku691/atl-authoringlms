package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsCoursesDto;
import com.ims.academic.entity.ImsCourses;
import com.ims.academic.repository.ImsCoursesRepository;
import com.ims.academic.service.ImsCoursesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsCoursesServiceImpl implements ImsCoursesService {

    private final ImsCoursesRepository repository;

    @Override
    public ImsCoursesDto create(ImsCoursesDto dto) {
        ImsCourses entity = ImsCourses.builder()
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
    public List<ImsCoursesDto> getByTenantId(String tenantId) {
        return repository.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsCoursesDto> getByProgramId(String tenantId, String programId) {
        return repository.findByTenantIdAndProgramId(tenantId, programId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ImsCoursesDto toDto(ImsCourses entity) {
        return ImsCoursesDto.builder()
                .id(entity.getId())
                .tenantId(entity.getTenantId())
                .programId(entity.getProgramId())
                .name(entity.getName())
                .code(entity.getCode())
                .build();
    }
}
