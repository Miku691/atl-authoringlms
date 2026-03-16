package com.ims.student.service.impl;

import com.ims.student.dto.ImsGuardiansDto;
import com.ims.student.entity.ImsGuardians;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsGuardiansRepo;
import com.ims.student.service.ImsGuardiansService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsGuardiansServiceImpl implements ImsGuardiansService {

    private final ImsGuardiansRepo repo;
    private final ModelMapper modelMapper;
    private final com.ims.student.client.AuthClient authClient;

    @Override
    public ImsGuardiansDto create(ImsGuardiansDto dto) {
        ImsGuardians entity = modelMapper.map(dto, ImsGuardians.class);
        ImsGuardians saved = repo.save(entity);
        return modelMapper.map(saved, ImsGuardiansDto.class);
    }

    @Override
    public ImsGuardiansDto update(String id, ImsGuardiansDto dto) {
        ImsGuardians existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));

        existing.setName(dto.getName());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setOccupation(dto.getOccupation());
        existing.setAddress(dto.getAddress());

        ImsGuardians updated = repo.save(existing);
        return modelMapper.map(updated, ImsGuardiansDto.class);
    }

    @Override
    public ImsGuardiansDto getById(String id) {
        return repo.findById(id)
                .map(entity -> modelMapper.map(entity, ImsGuardiansDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));
    }

    @Override
    public List<ImsGuardiansDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .map(entity -> modelMapper.map(entity, ImsGuardiansDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ImsGuardiansDto getByPhoneAndTenant(String phone, String tenantId) {
        return repo.findByPhoneAndTenantId(phone, tenantId)
                .map(entity -> modelMapper.map(entity, ImsGuardiansDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Guardian Phone", phone));
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Guardian ID", id);
        }
        repo.deleteById(id);
    }

    // Retaining this for existing admission flows if any, but adding tenant logic
    public ImsGuardians getOrCreate(ImsGuardiansDto dto) {
        Optional<ImsGuardians> existing = repo.findByPhoneAndTenantId(dto.getPhone(), dto.getTenantId());
        if (existing.isPresent()) {
            return existing.get();
        }
        ImsGuardians entity = modelMapper.map(dto, ImsGuardians.class);
        return repo.save(entity);
    }

    @Override
    public void grantAccess(String id) {
        ImsGuardians guardian = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));

        if (guardian.getUserId() != null) {
            throw new RuntimeException("Guardian already has access");
        }

        if (guardian.getEmail() == null || guardian.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required to grant access");
        }

        com.ims.student.dto.AuthSignupRequestDto signupRequest = com.ims.student.dto.AuthSignupRequestDto.builder()
                .username(guardian.getEmail())
                .email(guardian.getEmail())
                .tenantId(guardian.getTenantId())
                .roleCode("GUARDIAN")
                .build();

        com.ims.student.util.ApiResponse<java.util.Map<String, Object>> authResponse = authClient.signup(signupRequest);

        if (authResponse != null && "SUCCESS".equalsIgnoreCase(authResponse.getStatus())) {
            java.util.Map<String, Object> userData = authResponse.getApiData();
            if (userData != null && userData.get("id") != null) {
                guardian.setUserId(userData.get("id").toString());
                repo.save(guardian);
            }
        } else {
            String errorMsg = authResponse != null ? authResponse.getMessage() : "Unknown error from Auth Service";
            throw new RuntimeException("Failed to grant access: " + errorMsg);
        }
    }
}
