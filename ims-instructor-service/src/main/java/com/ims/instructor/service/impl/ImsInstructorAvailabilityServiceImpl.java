package com.ims.instructor.service.impl;

import com.ims.instructor.dto.ImsInstructorAvailabilityDto;
import com.ims.instructor.entity.ImsInstructorAvailability;
import com.ims.instructor.exception.ResourceNotFoundException;
import com.ims.instructor.repo.ImsInstructorAvailabilityRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorAvailabilityServiceImpl {

    private final ImsInstructorAvailabilityRepo repo;
    private final ModelMapper modelMapper;

    public ImsInstructorAvailabilityDto setAvailability(ImsInstructorAvailabilityDto dto) {
        // Simple logic: Create/Update slot (Assuming slots don't overlap for simplicity
        // now)
        // In future: Add overlap validation
        ImsInstructorAvailability entity = modelMapper.map(dto, ImsInstructorAvailability.class);
        return toDto(repo.save(entity));
    }

    public List<ImsInstructorAvailabilityDto> getByInstructor(String instructorId) {
        return repo.findByInstructorId(instructorId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Availability ID", id);
        }
        repo.deleteById(id);
    }

    private ImsInstructorAvailabilityDto toDto(ImsInstructorAvailability entity) {
        return modelMapper.map(entity, ImsInstructorAvailabilityDto.class);
    }
}
