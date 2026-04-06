package com.ims.student.service.impl;

import com.ims.student.client.AcademicClient;
import com.ims.student.client.AuthClient;
import com.ims.student.dto.AuthSignupRequestDto;
import com.ims.student.dto.external.ImsOfferingInstructorsDto;
import com.ims.student.entity.ImsStudents;
import com.ims.student.dto.ImsStudentsDto;
import com.ims.student.exception.ResourceAlreadyExistException;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentsService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentsServiceImpl implements ImsStudentsService {
    private final ImsStudentsRepo repo;
    private final ModelMapper modelMapper;
    private final AuthClient authClient;
    private final AcademicClient academicClient;

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
        existing.setMedicalHistory(dto.getMedicalHistory());
        existing.setPreviousEducation(dto.getPreviousEducation());
        existing.setBirthFormId(dto.getBirthFormId());
        existing.setIsOrphan(dto.getIsOrphan());
        existing.setCaste(dto.getCaste());
        existing.setPreviousSchool(dto.getPreviousSchool());
        existing.setAdmissionDiscount(dto.getAdmissionDiscount());

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

    @Override
    public ImsStudentsDto getStudentByUserId(String userId) {
        return repo.findByUserId(userId)
                .filter(s -> !s.isDeleted())
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("User Id", userId));
    }

    @Override
    public ImsStudentsDto getStudentByEmailAndTenantId(String email, String tenantId) {
        return repo.findByEmailAndTenantId(email, tenantId)
                .filter(s -> !s.isDeleted())
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Student Email", email));
    }

    @Override
    public long countByTenant(String tenantId) {
        return repo.countByTenantId(tenantId);
    }

    @Override
    public void grantAccess(String id) {
        ImsStudents student = repo.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Student id", id));

        if (student.getUserId() != null) {
            throw new ResourceAlreadyExistException("Student already has access", "STUDENT", "user_id");
        }

        if (student.getEmail() == null || student.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required to grant access");
        }

        AuthSignupRequestDto signupRequest = AuthSignupRequestDto.builder()
                .username(student.getEmail())
                .email(student.getEmail())
                .tenantId(student.getTenantId())
                .roleCode("STUDENT")
                .build();

        ApiResponse<Map<String, Object>> authResponse = authClient.signup(signupRequest);

        if (authResponse != null && "SUCCESS".equalsIgnoreCase(authResponse.getStatus())) {
            Map<String, Object> userData = authResponse.getApiData();
            if (userData != null && userData.get("id") != null) {
                student.setUserId(userData.get("id").toString());
                repo.save(student);
            }
        } else {
            String errorMsg = authResponse != null ? authResponse.getMessage() : "Unknown error from Auth Service";
            throw new RuntimeException("Failed to grant access: " + errorMsg);
        }
    }

    @Override
    public List<Map<String, Object>> getGenderStats(String tenantId) {
        return repo.countByGender(tenantId);
    }

    @Override
    public Page<ImsStudentsDto> searchStudents(String tenantId, String gender,
                                               String offeringId, String searchTerm, Pageable pageable) {
        return repo.searchStudents(tenantId, gender, offeringId, searchTerm, pageable)
                .map(this::toDto);
    }

    @Override
    public List<ImsStudentsDto> getByOffering(String tenantId, String offeringId) {
        return repo.findByOffering(tenantId, offeringId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsStudentsDto> getByInstructorId(String instructorId, String tenantId) {
        ApiResponse<List<ImsOfferingInstructorsDto>> assignmentsRes = academicClient.getByInstructorId(instructorId);

        if (assignmentsRes == null || assignmentsRes.getApiData() == null || assignmentsRes.getApiData().isEmpty()) {
            return List.of();
        }

        List<String> offeringIds = assignmentsRes.getApiData().stream()
                .map(ImsOfferingInstructorsDto::getOfferingId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (offeringIds.isEmpty()) {
            return List.of();
        }

        return repo.findByOfferingIn(tenantId, offeringIds).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
