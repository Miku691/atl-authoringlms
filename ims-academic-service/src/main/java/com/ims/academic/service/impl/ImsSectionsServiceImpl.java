package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsSectionsDto;
import com.ims.academic.entity.ImsClasses;
import com.ims.academic.entity.ImsSections;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsClassesRepo;
import com.ims.academic.repo.ImsSectionsRepo;
import com.ims.academic.service.ImsSectionsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsSectionsServiceImpl implements ImsSectionsService {

    private final ImsSectionsRepo repo;
    private final ImsClassesRepo classesRepo;
    private final ModelMapper modelMapper;

    private ImsSectionsDto toDto(ImsSections entity) {
        ImsSectionsDto dto = modelMapper.map(entity, ImsSectionsDto.class);
        dto.setClassId(entity.getImsClass().getId());
        return dto;
    }

    @Override
    public ImsSectionsDto create(ImsSectionsDto dto) {

        ImsClasses imsClass = classesRepo.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", dto.getClassId()));

        if (repo.existsByImsClassIdAndName(dto.getClassId(), dto.getName())) {
            throw new ResourceAlreadyExistException(
                    dto.getName(), "SECTION", "Name"
            );
        }

        ImsSections section = ImsSections.builder()
                .tenantId(dto.getTenantId())
                .imsClass(imsClass)
                .name(dto.getName())
                .build();

        return toDto(repo.save(section));
    }

    @Override
    public ImsSectionsDto update(String id, ImsSectionsDto dto) {

        ImsSections existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section ID", id));

        existing.setName(dto.getName());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsSectionsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Section ID", id));
    }

    @Override
    public List<ImsSectionsDto> getByClass(String classId) {
        return repo.findByImsClassId(classId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsSectionsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Section ID", id);
        }
        repo.deleteById(id);
    }
}