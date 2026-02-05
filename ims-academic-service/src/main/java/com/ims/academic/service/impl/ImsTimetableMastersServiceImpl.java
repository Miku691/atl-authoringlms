package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsTimetableMastersDto;
import com.ims.academic.entity.ImsTimetableMasters;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsTimetableMastersRepo;
import com.ims.academic.service.ImsTimetableMastersService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTimetableMastersServiceImpl implements ImsTimetableMastersService {

    private final ImsTimetableMastersRepo repo;
    private final ModelMapper modelMapper;

    private ImsTimetableMastersDto toDto(ImsTimetableMasters entity) {
        return modelMapper.map(entity, ImsTimetableMastersDto.class);
    }

    private ImsTimetableMasters toEntity(ImsTimetableMastersDto dto) {
        return modelMapper.map(dto, ImsTimetableMasters.class);
    }

    @Override
    @Transactional
    public ImsTimetableMastersDto create(ImsTimetableMastersDto dto) {
        ImsTimetableMasters entity = toEntity(dto);

        // Establish bidirectional relationship if slots are present on creation
        if (entity.getSlots() != null) {
            entity.getSlots().forEach(slot -> {
                slot.setTimetableMaster(entity);
                slot.setTenantId(entity.getTenantId()); // Cascade tenantId
                if (slot.getEntries() != null) {
                    slot.getEntries().forEach(entry -> {
                        entry.setTimetableSlot(slot);
                        entry.setTenantId(entity.getTenantId()); // Cascade tenantId
                    });
                }
            });
        }

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsTimetableMastersDto update(String id, ImsTimetableMastersDto dto) {
        ImsTimetableMasters existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Master ID", id));

        existing.setOfferingId(dto.getOfferingId());
        existing.setAcademicYearId(dto.getAcademicYearId());
        existing.setName(dto.getName());
        existing.setTimezone(dto.getTimezone());

        // Note: Updating children logic usually requires more complex diffing unless we
        // just replace.
        // For this simple implementation, we update base fields. Detailed child updates
        // usually go through their own specific endpoints or need full list replacement
        // logic.
        // We will assume basic field update here.

        return toDto(repo.save(existing));
    }

    @Override
    public ImsTimetableMastersDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Master ID", id));
    }

    @Override
    public List<ImsTimetableMastersDto> getByOfferingId(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsTimetableMastersDto> getByOfferingIdAndTenantId(String offeringId, String tenantId) {
        return repo.findByOfferingIdAndTenantId(offeringId, tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Timetable Master ID", id);
        }
        repo.deleteById(id);
    }
}
