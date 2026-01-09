package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsInstructorClassMappingsDto;
import com.ims.academic.entity.ImsInstructorClassMappings;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsInstructorClassMappingsRepo;
import com.ims.academic.service.ImsInstructorClassMappingsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorClassMappingsServiceImpl implements ImsInstructorClassMappingsService {

    private final ImsInstructorClassMappingsRepo repo;
    private final ModelMapper modelMapper;

    private ImsInstructorClassMappingsDto toDto(ImsInstructorClassMappings entity) {
        return modelMapper.map(entity, ImsInstructorClassMappingsDto.class);
    }

    private ImsInstructorClassMappings toEntity(ImsInstructorClassMappingsDto dto) {
        return modelMapper.map(dto, ImsInstructorClassMappings.class);
    }

    @Override
    @Transactional
    public ImsInstructorClassMappingsDto create(ImsInstructorClassMappingsDto dto) {
        ImsInstructorClassMappings entity = toEntity(dto);
        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsInstructorClassMappingsDto update(String id, ImsInstructorClassMappingsDto dto) {
        ImsInstructorClassMappings existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping ID", id));

        existing.setInstructorId(dto.getInstructorId());
        existing.setClassId(dto.getClassId());
        existing.setSectionId(dto.getSectionId());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsInstructorClassMappingsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping ID", id));
    }

    @Override
    public List<ImsInstructorClassMappingsDto> getByInstructorId(String instructorId) {
        return repo.findByInstructorId(instructorId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsInstructorClassMappingsDto> getByClassId(String classId) {
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
