package com.ims.student.service.impl;

import com.ims.student.dto.ImsStudentGuardiansDto;
import com.ims.student.entity.ImsStudentGuardians;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentGuardiansRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentGuardiansService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentGuardiansServiceImpl implements ImsStudentGuardiansService {

    private final ImsStudentGuardiansRepo repo;
    private final ImsStudentsRepo studentsRepo;
    private final ModelMapper modelMapper;

    private ImsStudentGuardiansDto toDto(ImsStudentGuardians e) {
        return modelMapper.map(e, ImsStudentGuardiansDto.class);
    }

    private ImsStudentGuardians toEntity(ImsStudentGuardiansDto dto) {
        return modelMapper.map(dto, ImsStudentGuardians.class);
    }

    @Override
    public ImsStudentGuardiansDto create(ImsStudentGuardiansDto dto) {
        // Ensure student exists
        studentsRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student ID", dto.getStudentId()));

        // No unique constraint check required as per design (allows siblings to have
        // same guardian)

        ImsStudentGuardians saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsStudentGuardiansDto update(String id, ImsStudentGuardiansDto dto) {
        ImsStudentGuardians existing = repo.findById(id)
                .filter(g -> !g.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));

        // Update allowed fields
        existing.setGuardianName(dto.getGuardianName());
        existing.setRelation(dto.getRelation());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setOccupation(dto.getOccupation());
        existing.setAddress(dto.getAddress());

        ImsStudentGuardians updated = repo.save(existing);
        return toDto(updated);
    }

    @Override
    public ImsStudentGuardiansDto getById(String id) {
        return repo.findById(id)
                .filter(g -> !g.isDeleted())
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));
    }

    @Override
    public List<ImsStudentGuardiansDto> getByStudentId(String studentId) {
        return repo.findByStudentId(studentId)
                .stream()
                .filter(g -> !g.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsStudentGuardiansDto> getAll() {
        return repo.findAll().stream()
                .filter(g -> !g.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        ImsStudentGuardians existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));

        existing.setDeleted(true);
        repo.save(existing);
    }
}
