package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsClassesDto;
import com.ims.academic.entity.ImsClasses;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.dto.ImsSectionsDto;
import com.ims.academic.repo.ImsClassesRepo;
import com.ims.academic.service.ImsClassesService;
import com.ims.academic.service.ImsSectionsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsClassesServiceImpl implements ImsClassesService {

    private final ImsClassesRepo repo;
    private final ImsSectionsService sectionsService;
    private final ModelMapper modelMapper;

    private ImsClassesDto toDto(ImsClasses entity) {
        return modelMapper.map(entity, ImsClassesDto.class);
    }

    private ImsClasses toEntity(ImsClassesDto dto) {
        return modelMapper.map(dto, ImsClasses.class);
    }

    @Override
    public ImsClassesDto create(ImsClassesDto dto) {

        if (repo.existsByTenantIdAndName(dto.getTenantId(), dto.getName())) {
            return repo.findByTenantIdAndName(dto.getTenantId(), dto.getName())
                    .map(this::toDto)
                    .orElseThrow(() -> new ResourceAlreadyExistException(dto.getName(), "CLASS", "Name"));
        }

        ImsClasses savedEntity = repo.save(toEntity(dto));

        // Create Sections/Offerings if programId is provided (manual dashboard creation)
        if (dto.getProgramId() != null) {
            int count = (dto.getSemesterCount() != null && dto.getSemesterCount() > 0) ? dto.getSemesterCount() : 1;
            
            for (int i = 1; i <= count; i++) {
                String offName = null;
                if (dto.getSemesterCount() != null && dto.getSemesterCount() > 1) {
                    offName = "Semester " + i;
                }
                
                ImsSectionsDto sectionDto = ImsSectionsDto.builder()
                        .tenantId(dto.getTenantId())
                        .classId(savedEntity.getId())
                        .name("A")
                        .capacity(dto.getCapacity())
                        .programId(dto.getProgramId())
                        .offeringName(offName)
                        .build();
                sectionsService.create(sectionDto);
            }
        }

        return toDto(savedEntity);
    }

    @Override
    public ImsClassesDto update(String id, ImsClassesDto dto) {

        ImsClasses existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", id));

        if (dto.getName() != null)
            existing.setName(dto.getName());
        if (dto.getCode() != null)
            existing.setCode(dto.getCode());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsClassesDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", id));
    }

    @Override
    public List<ImsClassesDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsClassesDto> getByOffering(String offeringId) {
        // This is now handled at the Section level, but keeping the method signature
        // for compatibility if needed
        // or we could throw exception. For now, empty list since no Class directly has
        // offeringId anymore.
        return List.of();
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Class ID", id);
        }
        repo.deleteById(id);
    }
}
