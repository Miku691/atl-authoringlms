package com.ims.instructor.service.impl;

import com.ims.instructor.dto.ImsInstructorsDto;
import com.ims.instructor.entity.ImsInstructors;
import com.ims.instructor.exception.ResourceAlreadyExistException;
import com.ims.instructor.exception.ResourceNotFoundException;
import com.ims.instructor.repo.ImsInstructorsRepo;
import com.ims.instructor.service.ImsInstructorsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorsServiceImpl implements ImsInstructorsService {

    private final ImsInstructorsRepo repo;
    private final ModelMapper modelMapper;

    private ImsInstructorsDto toDto(ImsInstructors ins) {
        return modelMapper.map(ins, ImsInstructorsDto.class);
    }

    private ImsInstructors toEntity(ImsInstructorsDto dto) {
        return modelMapper.map(dto, ImsInstructors.class);
    }

    @Override
    public ImsInstructorsDto create(ImsInstructorsDto dto) {

        if (repo.existsByUserId(dto.getUserId())) {
            throw new ResourceAlreadyExistException(dto.getUserId(), "INSTRUCTOR", "User ID");
        }

        ImsInstructors saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsInstructorsDto update(String id, ImsInstructorsDto dto) {

        ImsInstructors existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor ID", id));

        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setQualification(dto.getQualification());
        existing.setSpecialization(dto.getSpecialization());
        existing.setExperienceYears(dto.getExperienceYears());
        existing.setJoinDate(dto.getJoinDate());
        existing.setStatus(dto.getStatus());

        ImsInstructors updated = repo.save(existing);
        return toDto(updated);
    }

    @Override
    public ImsInstructorsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor ID", id));
    }

    @Override
    public List<ImsInstructorsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsInstructorsDto> getAll() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Instructor ID", id);
        }
        repo.deleteById(id);
    }
}
