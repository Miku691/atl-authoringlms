package com.ims.student.service.impl;

import com.ims.student.entity.ImsStudents;
import com.ims.student.dto.ImsStudentsDto;
import com.ims.student.exception.ResourceAlreadyExistException;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentsServiceImpl implements ImsStudentsService {
    private final ImsStudentsRepo repo;
    private final ModelMapper modelMapper;

    private ImsStudentsDto toDto(ImsStudents e) {
        return modelMapper.map(e, ImsStudentsDto.class);
    }

    private ImsStudents toEntity(ImsStudentsDto dto) {
        return modelMapper.map(dto, ImsStudents.class);
    }

    @Override
    @Transactional
    public ImsStudentsDto create(ImsStudentsDto dto) {
        // Validation: Identity Only

        // Global uniqueness checks
        if (dto.getEmail() != null && repo.existsByEmail(dto.getEmail())) {
            throw new ResourceAlreadyExistException(dto.getEmail(), "STUDENT", "Email");
        }
        if (dto.getPhone() != null && repo.existsByPhone(dto.getPhone())) {
            throw new ResourceAlreadyExistException(dto.getPhone(), "STUDENT", "Phone No");
        }
        if (dto.getAdmissionNo() != null && repo.existsByAdmissionNo(dto.getAdmissionNo())) {
            throw new ResourceAlreadyExistException(dto.getAdmissionNo(), "STUDENT", "Admission No");
        }

        // Set default status if missing
        if (dto.getStatus() == null) {
            dto.setStatus("ACTIVE");
        }

        ImsStudents saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsStudentsDto update(String id, ImsStudentsDto dto) {
        ImsStudents existing = repo.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Student id", id));

        // Check for global uniqueness if changed
        if (dto.getEmail() != null && !dto.getEmail().equals(existing.getEmail())
                && repo.existsByEmail(dto.getEmail())) {
            throw new ResourceAlreadyExistException(dto.getEmail(), "STUDENT", "Email");
        }
        if (dto.getPhone() != null && !dto.getPhone().equals(existing.getPhone())
                && repo.existsByPhone(dto.getPhone())) {
            throw new ResourceAlreadyExistException(dto.getPhone(), "STUDENT", "Phone No");
        }
        if (dto.getAdmissionNo() != null && !dto.getAdmissionNo().equals(existing.getAdmissionNo())
                && repo.existsByAdmissionNo(dto.getAdmissionNo())) {
            throw new ResourceAlreadyExistException(dto.getAdmissionNo(), "STUDENT", "Admission No");
        }

        // Update allowed fields
        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setDob(dto.getDob());
        existing.setGender(dto.getGender());
        existing.setBloodGroup(dto.getBloodGroup());
        existing.setAdmissionNo(dto.getAdmissionNo());
        existing.setAdmissionDate(dto.getAdmissionDate());
        existing.setCategory(dto.getCategory());
        existing.setReligion(dto.getReligion());
        existing.setProfileImageUrl(dto.getProfileImageUrl());
        existing.setStatus(dto.getStatus());
        existing.setAddress(dto.getAddress());

        ImsStudents updated = repo.save(existing);
        return toDto(updated);
    }

    @Override
    public List<ImsStudentsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .filter(s -> !s.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ImsStudentsDto getById(String id) {
        return repo.findById(id)
                .filter(s -> !s.isDeleted())
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("student id", id));
    }

    @Override
    public List<ImsStudentsDto> getAll() {
        return repo.findAll().stream()
                .filter(s -> !s.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        ImsStudents existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("student id", id));

        existing.setDeleted(true);
        existing.setStatus("INACTIVE");
        repo.save(existing);
    }
}
