package com.ims.staff.service.impl;

import com.ims.staff.dto.ImsStaffDto;
import com.ims.staff.entity.ImsStaff;
import com.ims.staff.exception.ResourceAlreadyExistException;
import com.ims.staff.exception.ResourceNotFoundException;
import com.ims.staff.repo.ImsStaffRepo;
import com.ims.staff.service.ImsStaffService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStaffServiceImpl implements ImsStaffService {

    private final ImsStaffRepo repo;
    private final ModelMapper modelMapper;
    private final com.ims.staff.client.AuthClient authClient;

    private ImsStaffDto toDto(ImsStaff staff) {
        return modelMapper.map(staff, ImsStaffDto.class);
    }

    private ImsStaff toEntity(ImsStaffDto dto) {
        return modelMapper.map(dto, ImsStaff.class);
    }

    @Override
    public ImsStaffDto create(ImsStaffDto dto) {

        if (dto.getEmployeeId() == null || dto.getEmployeeId().isEmpty()) {
            dto.setEmployeeId(generateUniqueEmployeeId());
        } else if (repo.existsByEmployeeId(dto.getEmployeeId())) {
            throw new ResourceAlreadyExistException(dto.getEmployeeId(), "STAFF", "Employee ID");
        }

        if (repo.existsByPhone(dto.getPhone())) {
            throw new ResourceAlreadyExistException(dto.getPhone(), "STAFF", "Phone Number");
        }

        if (dto.getEmail() != null && repo.existsByEmail(dto.getEmail())) {
            throw new ResourceAlreadyExistException(dto.getEmail(), "STAFF", "Email");
        }

        ImsStaff saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsStaffDto update(String id, ImsStaffDto dto) {

        ImsStaff existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", id));

        if (dto.getFirstName() != null)
            existing.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null)
            existing.setLastName(dto.getLastName());
        if (dto.getStatus() != null)
            existing.setStatus(dto.getStatus());

        if (dto.getPhone() != null &&
                !dto.getPhone().equals(existing.getPhone())) {
            if (repo.existsByPhone(dto.getPhone())) {
                throw new ResourceAlreadyExistException(dto.getPhone(), "STAFF", "Phone Number");
            }
            existing.setPhone(dto.getPhone());
        }

        if (dto.getEmail() != null &&
                !dto.getEmail().equals(existing.getEmail())) {
            if (repo.existsByEmail(dto.getEmail())) {
                throw new ResourceAlreadyExistException(dto.getEmail(), "STAFF", "Email");
            }
            existing.setEmail(dto.getEmail());
        }

        // Broad profile fields
        if (dto.getEmployeeId() != null)
            existing.setEmployeeId(dto.getEmployeeId());
        if (dto.getJoinDate() != null)
            existing.setJoinDate(dto.getJoinDate());
        if (dto.getDob() != null)
            existing.setDob(dto.getDob());
        if (dto.getGender() != null)
            existing.setGender(dto.getGender());
        if (dto.getAddress() != null)
            existing.setAddress(dto.getAddress());
        if (dto.getRole() != null)
            existing.setRole(dto.getRole());
        if (dto.getDepartment() != null)
            existing.setDepartment(dto.getDepartment());
        if (dto.getMonthlySalary() != null)
            existing.setMonthlySalary(dto.getMonthlySalary());
        if (dto.getQualification() != null)
            existing.setQualification(dto.getQualification());
        if (dto.getExperience() != null)
            existing.setExperience(dto.getExperience());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsStaffDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", id));
    }

    @Override
    public Page<ImsStaffDto> getByTenant(String tenantId, Pageable pageable) {
        return repo.findByTenantId(tenantId, pageable)
                .map(this::toDto);
    }
 
    @Override
    public Page<ImsStaffDto> getAll(Pageable pageable) {
        return repo.findAll(pageable)
                .map(this::toDto);
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Staff ID", id);
        }
        repo.deleteById(id);
    }

    @Override
    public void grantAccess(String id) {
        ImsStaff staff = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", id));

        if (staff.getUserId() != null) {
            throw new ResourceAlreadyExistException("Staff already has access", "STAFF", "user_id");
        }

        if (staff.getEmail() == null || staff.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required to grant access");
        }

        com.ims.staff.dto.AuthSignupRequestDto signupRequest = com.ims.staff.dto.AuthSignupRequestDto.builder()
                .username(staff.getEmail())
                .email(staff.getEmail())
                .tenantId(staff.getTenantId())
                .roleCode("STAFF")
                .build();

        com.ims.staff.util.ApiResponse<java.util.Map<String, Object>> authResponse = authClient.signup(signupRequest);

        if (authResponse != null && "SUCCESS".equalsIgnoreCase(authResponse.getStatus())) {
            java.util.Map<String, Object> userData = authResponse.getApiData();
            if (userData != null && userData.get("id") != null) {
                staff.setUserId(userData.get("id").toString());
                repo.save(staff);
            }
        } else {
            String errorMsg = authResponse != null ? authResponse.getMessage() : "Unknown error from Auth Service";
            throw new RuntimeException("Failed to grant access: " + errorMsg);
        }
    }

    private String generateUniqueEmployeeId() {
        String base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(base.charAt(random.nextInt(base.length())));
            }
            code = com.ims.staff.util.ApplicationConstant.EMP_ID_PREFIX + sb.toString();
        } while (repo.existsByEmployeeId(code));
        return code;
    }
}