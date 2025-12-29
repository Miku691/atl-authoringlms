package com.ims.student.service.impl;

import com.ims.student.dto.ImsStudentEnrollmentsDto;
import com.ims.student.entity.ImsStudentEnrollments;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentEnrollmentsRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentEnrollmentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentEnrollmentsServiceImpl implements ImsStudentEnrollmentsService {

    private final ImsStudentEnrollmentsRepo repo;
    private final ImsStudentsRepo studentsRepo;
    private final ModelMapper modelMapper;

    private ImsStudentEnrollmentsDto toDto(ImsStudentEnrollments e) {
        return modelMapper.map(e, ImsStudentEnrollmentsDto.class);
    }

    private ImsStudentEnrollments toEntity(ImsStudentEnrollmentsDto dto) {
        return modelMapper.map(dto, ImsStudentEnrollments.class);
    }

    @Override
    public ImsStudentEnrollmentsDto create(ImsStudentEnrollmentsDto dto) {

        studentsRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student ID", dto.getStudentId()));

        ImsStudentEnrollments saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsStudentEnrollmentsDto update(String id, ImsStudentEnrollmentsDto dto) {
        ImsStudentEnrollments existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment ID", id));

        existing.setClassId(dto.getClassId());
        existing.setSectionId(dto.getSectionId());
        existing.setBatchId(dto.getBatchId());
        existing.setRollNo(dto.getRollNo());
        existing.setAcademicYear(dto.getAcademicYear());

        ImsStudentEnrollments updated = repo.save(existing);
        return toDto(updated);
    }

    @Override
    public ImsStudentEnrollmentsDto getById(String id) {
        return repo.findById(id).map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment ID", id));
    }

    @Override
    public List<ImsStudentEnrollmentsDto> getByStudentId(String studentId) {
        return repo.findByStudentId(studentId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<ImsStudentEnrollmentsDto> getAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Enrollment ID", id);
        }
        repo.deleteById(id);
    }
}