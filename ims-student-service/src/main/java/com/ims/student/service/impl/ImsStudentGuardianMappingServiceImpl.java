package com.ims.student.service.impl;

import com.ims.student.dto.ImsStudentGuardianMappingDto;
import com.ims.student.entity.ImsGuardians;
import com.ims.student.entity.ImsStudentGuardianMapping;
import com.ims.student.entity.ImsStudents;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsGuardiansRepo;
import com.ims.student.repo.ImsStudentGuardianMappingRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentGuardianMappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentGuardianMappingServiceImpl implements ImsStudentGuardianMappingService {

    private final ImsStudentGuardianMappingRepo repo;
    private final ImsStudentsRepo studentsRepo;
    private final ImsGuardiansRepo guardiansRepo;

    @Override
    @Transactional
    public ImsStudentGuardianMappingDto map(ImsStudentGuardianMappingDto dto) {
        ImsStudents student = studentsRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student ID", dto.getStudentId()));

        ImsGuardians guardian = guardiansRepo.findById(dto.getGuardianId())
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", dto.getGuardianId()));

        ImsStudentGuardianMapping entity = ImsStudentGuardianMapping.builder()
                .student(student)
                .guardian(guardian)
                .tenantId(student.getTenantId())
                .relation(dto.getRelation())
                .isPrimary(dto.isPrimary())
                .build();

        ImsStudentGuardianMapping saved = repo.save(entity);
        return toDto(saved);
    }

    @Override
    public List<ImsStudentGuardianMappingDto> getByStudentId(String studentId) {
        return repo.findByStudentId(studentId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsStudentGuardianMappingDto> getByGuardianId(String guardianId) {
        return repo.findByGuardianId(guardianId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void unmap(String mappingId) {
        repo.deleteById(mappingId);
    }

    private ImsStudentGuardianMappingDto toDto(ImsStudentGuardianMapping entity) {
        return ImsStudentGuardianMappingDto.builder()
                .id(entity.getId())
                .studentId(entity.getStudent().getId())
                .guardianId(entity.getGuardian().getId())
                .tenantId(entity.getTenantId())
                .relation(entity.getRelation())
                .isPrimary(entity.isPrimary())
                .studentName(entity.getStudent().getFirstName() + " " + entity.getStudent().getLastName())
                .guardianName(entity.getGuardian().getName())
                .guardianPhone(entity.getGuardian().getPhone())
                .build();
    }
}
