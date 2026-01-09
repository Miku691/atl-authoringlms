package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsOfferingClassMappingsDto;
import com.ims.academic.entity.ImsOfferingClassMappings;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingClassMappingsRepo;
import com.ims.academic.service.ImsOfferingClassMappingsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsOfferingClassMappingsServiceImpl implements ImsOfferingClassMappingsService {

    private final ImsOfferingClassMappingsRepo repo;
    private final ModelMapper modelMapper;

    private ImsOfferingClassMappingsDto toDto(ImsOfferingClassMappings entity) {
        return modelMapper.map(entity, ImsOfferingClassMappingsDto.class);
    }

    private ImsOfferingClassMappings toEntity(ImsOfferingClassMappingsDto dto) {
        return modelMapper.map(dto, ImsOfferingClassMappings.class);
    }

    @Override
    @Transactional
    public ImsOfferingClassMappingsDto create(ImsOfferingClassMappingsDto dto) {
        ImsOfferingClassMappings entity = toEntity(dto);
        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsOfferingClassMappingsDto update(String id, ImsOfferingClassMappingsDto dto) {
        ImsOfferingClassMappings existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping ID", id));

        existing.setOfferingId(dto.getOfferingId());
        existing.setClassId(dto.getClassId());
        existing.setSectionId(dto.getSectionId());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsOfferingClassMappingsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping ID", id));
    }

    @Override
    public List<ImsOfferingClassMappingsDto> getByOfferingId(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsOfferingClassMappingsDto> getByClassId(String classId) {
        return repo.findByClassId(classId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Mapping ID", id);
        }
        repo.deleteById(id);
    }
}
