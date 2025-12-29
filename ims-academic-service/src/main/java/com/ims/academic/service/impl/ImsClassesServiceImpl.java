package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsClassesDto;
import com.ims.academic.entity.ImsClasses;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsClassesRepo;
import com.ims.academic.service.ImsClassesService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsClassesServiceImpl implements ImsClassesService {

    private final ImsClassesRepo repo;
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
            throw new ResourceAlreadyExistException(
                    dto.getName(), "CLASS", "Name"
            );
        }

        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsClassesDto update(String id, ImsClassesDto dto) {

        ImsClasses existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", id));

        existing.setName(dto.getName());
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
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Class ID", id);
        }
        repo.deleteById(id);
    }
}
