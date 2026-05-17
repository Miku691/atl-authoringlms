package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsAnnouncementDto;
import com.ims.academic.entity.ImsAnnouncement;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAnnouncementRepo;
import com.ims.academic.service.ImsAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAnnouncementServiceImpl implements ImsAnnouncementService {

    private final ImsAnnouncementRepo repo;
    private final ModelMapper modelMapper;

    private ImsAnnouncementDto toDto(ImsAnnouncement entity) {
        return modelMapper.map(entity, ImsAnnouncementDto.class);
    }

    private ImsAnnouncement toEntity(ImsAnnouncementDto dto) {
        return modelMapper.map(dto, ImsAnnouncement.class);
    }

    @Override
    @Transactional
    public ImsAnnouncementDto create(ImsAnnouncementDto dto) {
        ImsAnnouncement entity = toEntity(dto);
        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsAnnouncementDto update(String id, ImsAnnouncementDto dto) {
        ImsAnnouncement entity = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setTargetAudience(dto.getTargetAudience());
        entity.setPriority(dto.getPriority());
        entity.setExpiryDate(dto.getExpiryDate());
        return toDto(repo.save(entity));
    }

    @Override
    public ImsAnnouncementDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
    }

    @Override
    public List<ImsAnnouncementDto> getByTenantId(String tenantId) {
        return repo.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsAnnouncementDto> getFilteredAnnouncements(String tenantId, String audience, String priority, String search) {
        return repo.findFilteredAnnouncements(tenantId, audience, priority, search)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsAnnouncementDto> getActiveByAudience(String tenantId, String audience) {
        return repo.findActiveByAudience(tenantId, audience, LocalDateTime.now())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Announcement", id);
        }
        repo.deleteById(id);
    }
}
