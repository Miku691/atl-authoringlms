package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsTenantSettingsDto;
import com.ims.academic.entity.ImsTenantSettings;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsTenantSettingsRepo;
import com.ims.academic.service.ImsTenantSettingsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTenantSettingsServiceImpl implements ImsTenantSettingsService {

    private final ImsTenantSettingsRepo repo;
    private final ModelMapper modelMapper;

    private ImsTenantSettingsDto toDto(ImsTenantSettings entity) {
        return modelMapper.map(entity, ImsTenantSettingsDto.class);
    }

    private ImsTenantSettings toEntity(ImsTenantSettingsDto dto) {
        return modelMapper.map(dto, ImsTenantSettings.class);
    }

    @Override
    @Transactional
    public ImsTenantSettingsDto createOrUpdate(ImsTenantSettingsDto dto) {
        ImsTenantSettings entity;
        if (repo.existsById(dto.getTenantId())) {
            entity = repo.findById(dto.getTenantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tenant ID", dto.getTenantId()));
            entity.setSettings(dto.getSettings());
            entity.setUpdatedAt(LocalDateTime.now());
        } else {
            entity = toEntity(dto);
            entity.setUpdatedAt(LocalDateTime.now());
        }
        return toDto(repo.save(entity));
    }

    @Override
    public ImsTenantSettingsDto getById(String tenantId) {
        return repo.findById(tenantId)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant ID", tenantId));
    }

    @Override
    public List<ImsTenantSettingsDto> getAll() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String tenantId) {
        if (!repo.existsById(tenantId)) {
            throw new ResourceNotFoundException("Tenant ID", tenantId);
        }
        repo.deleteById(tenantId);
    }
}
