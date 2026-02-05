package com.ims.instructor.service.impl;

import com.ims.instructor.dto.ImsInstructorSubjectsDto;
import com.ims.instructor.service.ImsInstructorSubjectsService;
import com.ims.instructor.entity.ImsInstructorSubjects;
import com.ims.instructor.exception.ResourceAlreadyExistException;
import com.ims.instructor.exception.ResourceNotFoundException;
import com.ims.instructor.repo.ImsInstructorSubjectsRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorSubjectsServiceImpl implements ImsInstructorSubjectsService {

    private final ImsInstructorSubjectsRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public ImsInstructorSubjectsDto assign(ImsInstructorSubjectsDto dto) {
        if (repo.findByInstructorIdAndSubjectId(dto.getInstructorId(), dto.getSubjectId()).isPresent()) {
            throw new ResourceAlreadyExistException(dto.getSubjectId(), "INSTRUCTOR_SUBJECT",
                    "Subject already assigned");
        }

        ImsInstructorSubjects entity = modelMapper.map(dto, ImsInstructorSubjects.class);
        return toDto(repo.save(entity));
    }

    @Override
    public List<ImsInstructorSubjectsDto> getByInstructor(String instructorId) {
        return repo.findByInstructorId(instructorId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ImsInstructorSubjectsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Mapping ID", id));
    }

    @Override
    public List<ImsInstructorSubjectsDto> getAll() {
        return repo.findAll().stream()
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

    private ImsInstructorSubjectsDto toDto(ImsInstructorSubjects entity) {
        return modelMapper.map(entity, ImsInstructorSubjectsDto.class);
    }
}
