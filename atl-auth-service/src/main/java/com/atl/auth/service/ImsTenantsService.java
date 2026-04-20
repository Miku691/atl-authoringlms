package com.atl.auth.service;

import com.atl.auth.dto.AtlUpdateAtlUserDto;
import com.atl.auth.dto.ImsTenantsDto;
import com.atl.auth.entity.AtlUser;
import com.atl.auth.entity.ImsTenants;
import com.atl.auth.exception.ApiResponse;
import com.atl.auth.exception.ResourceNotFoundException;
import com.atl.auth.repo.AtlUserRepo;
import com.atl.auth.repo.ImsTenantsRepo;
import com.atl.auth.utility.ApplicationConstant;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTenantsService {
    private final ImsTenantsRepo repo;
    private final ModelMapper modelMapper;
    private final AtlUserService userService;
    private final AtlUserRepo userRepo;
    private final com.atl.auth.client.AcademicClient academicClient;

    private ImsTenantsDto convertToDto(ImsTenants entity) {
        return modelMapper.map(entity, ImsTenantsDto.class);
    }

    private ImsTenants convertToEntity(ImsTenantsDto dto) {
        return modelMapper.map(dto, ImsTenants.class);
    }

    public ApiResponse<ImsTenantsDto> create(ImsTenantsDto dto) {
        // Generate unique tenant code
        String tenantCode = generateUniqueTenantCode();
        dto.setTenantCode(tenantCode);
        AtlUser user = userRepo.findByUsername(dto.getBootstrapUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User Id", dto.getBootstrapUsername()));

        ImsTenants saved = repo.save(convertToEntity(dto));

        if (saved.getId() != null) {
            userService.updateUserStatusOrTenantId(new AtlUpdateAtlUserDto(user.getUsername(), user.getEmail(),
                    ApplicationConstant.USER_ACTIVE, saved));
        }

        return ApiResponse.<ImsTenantsDto>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.CREATED.value())
                .message("Tenant created successfully")
                .apiData(convertToDto(saved))
                .build();
    }

    public ImsTenantsDto update(String id, ImsTenantsDto dto) {
        ImsTenants existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        if (dto.getTenantName() != null) existing.setTenantName(dto.getTenantName());
        if (dto.getTenantCode() != null) existing.setTenantCode(dto.getTenantCode());
        if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
        if (dto.getContactEmail() != null) existing.setContactEmail(dto.getContactEmail());
        if (dto.getContactPhone() != null) existing.setContactPhone(dto.getContactPhone());
        if (dto.getIsActive() != null) existing.setIsActive(dto.getIsActive());
        if (dto.getCurrency() != null) existing.setCurrency(dto.getCurrency());
        if (dto.getCountry() != null) existing.setCountry(dto.getCountry());
        if (dto.getState() != null) existing.setState(dto.getState());
        if (dto.getLatitude() != null) existing.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) existing.setLongitude(dto.getLongitude());

        ImsTenants updated = repo.save(existing);
        return convertToDto(updated);
    }

    public ImsTenantsDto getById(String id) {
        return repo.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
    }

    public List<ImsTenantsDto> getAll() {
        return repo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found");
        }
        repo.deleteById(id);
    }

    public void verifySetup(String id, com.atl.auth.enums.TenantType type) {
        ImsTenants tenant = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));

        // Verify with Academic Service
        Boolean isSetupInAcademic = academicClient.checkSetupStatus(id);

        if (Boolean.TRUE.equals(isSetupInAcademic)) {
            tenant.setSetupCompleted(true);
            if (type != null) {
                tenant.setType(type);
            }
            repo.save(tenant);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant setup not completed in Academic Service");
        }
    }
    private String generateUniqueTenantCode() {
        String base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(base.charAt(random.nextInt(base.length())));
            }
            code = ApplicationConstant.TENANT_CODE_PREFIX + sb.toString();
        } while (repo.existsByTenantCode(code));
        return code;
    }
}
