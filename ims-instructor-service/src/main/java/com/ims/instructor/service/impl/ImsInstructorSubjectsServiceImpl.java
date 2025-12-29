package com.ims.instructor.service.impl;

import com.ims.instructor.dto.ImsInstructorSubjectsDto;
import com.ims.instructor.entity.ImsInstructorSubjects;
import com.ims.instructor.exception.ResourceAlreadyExistException;
import com.ims.instructor.exception.ResourceNotFoundException;
import com.ims.instructor.repo.ImsInstructorSubjectsRepo;
import com.ims.instructor.repo.ImsInstructorsRepo;
import com.ims.instructor.service.ImsInstructorSubjectsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorSubjectsServiceImpl implements ImsInstructorSubjectsService {

    private final ImsInstructorSubjectsRepo repo;
    private final ImsInstructorsRepo instructorsRepo;
    private final ModelMapper modelMapper;

    private ImsInstructorSubjectsDto toDto(ImsInstructorSubjects e) {
        return modelMapper.map(e, ImsInstructorSubjectsDto.class);
    }

    private ImsInstructorSubjects toEntity(ImsInstructorSubjectsDto dto) {
        return modelMapper.map(dto, ImsInstructorSubjects.class);
    }

    @Override
    public ImsInstructorSubjectsDto assign(ImsInstructorSubjectsDto dto) {
        // Instructor must exist
        instructorsRepo.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor ID", dto.getInstructorId()));

        // Avoid duplicates
        if (repo.existsByInstructorIdAndSubjectId(dto.getInstructorId(), dto.getSubjectId())) {
            throw new ResourceAlreadyExistException(dto.getSubjectId(), "INSTRUCTOR-SUBJECT", "Subject");
        }

        ImsInstructorSubjects saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public List<ImsInstructorSubjectsDto> getByInstructor(String instructorId) {
        return repo.findByInstructorId(instructorId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ImsInstructorSubjectsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor-Subject ID", id));
    }

    @Override
    public List<ImsInstructorSubjectsDto> getAll() {
        return repo.findAll()
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Instructor-Subject ID", id);
        }
        repo.deleteById(id);
    }
}
