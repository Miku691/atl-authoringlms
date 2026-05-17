package com.ims.instructor.service.impl;

import com.ims.instructor.client.AuthClient;
import com.ims.instructor.dto.AuthSignupRequestDto;
import com.ims.instructor.dto.ImsInstructorsDto;
import com.ims.instructor.entity.ImsInstructors;
import com.ims.instructor.exception.ResourceAlreadyExistException;
import com.ims.instructor.exception.ResourceNotFoundException;
import com.ims.instructor.repo.ImsInstructorsRepo;
import com.ims.instructor.service.ImsInstructorsService;
import com.ims.instructor.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorsServiceImpl implements ImsInstructorsService {

    private final ImsInstructorsRepo repo;
    private final ModelMapper modelMapper;
    private final AuthClient authClient;
    private final com.ims.instructor.client.PlatformClient platformClient;

    private ImsInstructorsDto toDto(ImsInstructors ins) {
        return modelMapper.map(ins, ImsInstructorsDto.class);
    }

    private ImsInstructors toEntity(ImsInstructorsDto dto) {
        return modelMapper.map(dto, ImsInstructors.class);
    }

    @Override
    public ImsInstructorsDto create(ImsInstructorsDto dto) {
        // SaaS Limit Enforcement
        com.ims.instructor.dto.SubscriptionLimitsDto limits = platformClient.getTenantLimits(dto.getTenantId());
        long currentCount = repo.countByTenantId(dto.getTenantId());

        if (limits != null && limits.getMaxTeachers() != null && limits.getMaxTeachers() > 0) {
            if (currentCount >= limits.getMaxTeachers()) {
                throw new com.ims.instructor.exception.LimitExceededException(
                        String.format("Limit Reached: Your current plan '%s' allows only %d teachers. You already have %d teachers. Please upgrade to add more.",
                                limits.getPlanName(), limits.getMaxTeachers(), currentCount)
                );
            }
        }

        if (dto.getEmployeeId() == null || dto.getEmployeeId().isEmpty()) {
            dto.setEmployeeId(generateUniqueEmployeeId(dto.getTenantId()));
        } else if (repo.existsByEmployeeIdAndTenantId(dto.getEmployeeId(), dto.getTenantId())) {
            throw new ResourceAlreadyExistException(dto.getEmployeeId(), "INSTRUCTOR", "Employee ID");
        }

        if(dto.getUserId() != null){
            if (repo.existsByUserId(dto.getUserId())) {
                throw new ResourceAlreadyExistException(dto.getUserId(), "INSTRUCTOR", "User ID");
            }
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
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        
        if (dto.getEmployeeId() != null && !dto.getEmployeeId().equals(existing.getEmployeeId())
                && repo.existsByEmployeeIdAndTenantId(dto.getEmployeeId(), existing.getTenantId())) {
            throw new ResourceAlreadyExistException(dto.getEmployeeId(), "INSTRUCTOR", "Employee ID");
        }
        existing.setEmployeeId(dto.getEmployeeId());
        existing.setDob(dto.getDob());
        existing.setGender(dto.getGender());
        existing.setAddress(dto.getAddress());
        existing.setQualification(dto.getQualification());
        existing.setSpecialization(dto.getSpecialization());
        existing.setExperience(dto.getExperience());
        existing.setMonthlySalary(dto.getMonthlySalary());
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
    public ImsInstructorsDto getByUserId(String userId) {
        return repo.findByUserId(userId)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor User ID", userId));
    }

    @Override
    public Page<ImsInstructorsDto> getByTenant(String tenantId, Pageable pageable) {
        return repo.findByTenantId(tenantId, pageable)
                .map(this::toDto);
    }

    @Override
    public Page<ImsInstructorsDto> getAll(Pageable pageable) {
        return repo.findAll(pageable)
                .map(this::toDto);
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Instructor ID", id);
        }
        repo.deleteById(id);
    }

    @Override
    public ImsInstructorsDto getByEmailAndTenantId(String email, String tenantId) {
        return repo.findByEmailAndTenantId(email, tenantId)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor Email", email));
    }

    @Override
    public long countByTenant(String tenantId) {
        return repo.countByTenantId(tenantId);
    }

    @Override
    public void grantAccess(String id) {
        ImsInstructors instructor = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor ID", id));

        if (instructor.getUserId() != null) {
            throw new ResourceAlreadyExistException(instructor.getUserId(), "INSTRUCTOR", "user_id");
        }

        if (instructor.getEmail() == null || instructor.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required to grant access");
        }

        AuthSignupRequestDto signupRequest = AuthSignupRequestDto
                .builder()
                .username(instructor.getEmail())
                .email(instructor.getEmail())
                .tenantId(instructor.getTenantId())
                .roleCode("INSTRUCTOR")
                .build();

        ApiResponse<Map<String, Object>> authResponse = authClient.signup(signupRequest);

        if (authResponse != null && "SUCCESS".equalsIgnoreCase(authResponse.getStatus())) {
            java.util.Map<String, Object> userData = authResponse.getApiData();
            if (userData != null && userData.get("id") != null) {
                instructor.setUserId(userData.get("id").toString());
                repo.save(instructor);
            }
        } else {
            String errorMsg = authResponse != null ? authResponse.getMessage() : "Unknown error from Auth Service";
            throw new RuntimeException("Failed to grant access: " + errorMsg);
        }
    }

    private String generateUniqueEmployeeId(String tenantId) {
        String base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(base.charAt(random.nextInt(base.length())));
            }
            code = com.ims.instructor.util.ApplicationConstant.EMP_ID_PREFIX + sb.toString();
        } while (repo.existsByEmployeeIdAndTenantId(code, tenantId));
        return code;
    }

    @Override
    public long getTodayBirthdaysCount(String tenantId) {
        java.time.LocalDate now = java.time.LocalDate.now();
        return repo.countTodayBirthdays(tenantId, now.getMonthValue(), now.getDayOfMonth());
    }
}

