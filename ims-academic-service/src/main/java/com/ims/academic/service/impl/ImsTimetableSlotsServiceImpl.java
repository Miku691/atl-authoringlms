package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsTimetableSlotsDto;
import com.ims.academic.entity.ImsTimetableMasters;
import com.ims.academic.entity.ImsTimetableSlots;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsTimetableMastersRepo;
import com.ims.academic.repo.ImsTimetableSlotsRepo;
import com.ims.academic.service.ImsTimetableSlotsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTimetableSlotsServiceImpl implements ImsTimetableSlotsService {

    private final ImsTimetableSlotsRepo repo;
    private final ImsTimetableMastersRepo masterRepo;
    private final ModelMapper modelMapper;

    private ImsTimetableSlotsDto toDto(ImsTimetableSlots entity) {
        ImsTimetableSlotsDto dto = modelMapper.map(entity, ImsTimetableSlotsDto.class);
        if (entity.getTimetableMaster() != null) {
            dto.setTimetableMasterId(entity.getTimetableMaster().getId());
        }
        return dto;
    }

    private ImsTimetableSlots toEntity(ImsTimetableSlotsDto dto) {
        return modelMapper.map(dto, ImsTimetableSlots.class);
    }

    @Override
    @Transactional
    public ImsTimetableSlotsDto create(ImsTimetableSlotsDto dto) {
        ImsTimetableSlots entity = toEntity(dto);

        ImsTimetableMasters master = masterRepo.findById(dto.getTimetableMasterId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Master ID", dto.getTimetableMasterId()));
        entity.setTimetableMaster(master);

        if (repo.existsByTimetableMasterIdAndDayOfWeekAndSlotLabelAndTenantId(master.getId(), dto.getDayOfWeek(),
                dto.getSlotLabel(), dto.getTenantId())) {
            throw new ResourceAlreadyExistException(dto.getSlotLabel(), "Timetable Slot", "label");
        }

        entity.setPeriodNumber(dto.getPeriodNumber());

        // Also handle children linking if passed?
        // For simple CRUD, usually children are added separately or mapped correctly.
        // If children are present in DTO, ensure they link back.
        if (entity.getEntries() != null) {
            entity.getEntries().forEach(entry -> entry.setTimetableSlot(entity));
        }

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsTimetableSlotsDto update(String id, ImsTimetableSlotsDto dto) {
        ImsTimetableSlots existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Slot ID", id));

        if (!existing.getSlotLabel().equals(dto.getSlotLabel())
                || !existing.getDayOfWeek().equals(dto.getDayOfWeek())) {
            if (repo.existsByTimetableMasterIdAndDayOfWeekAndSlotLabelAndTenantId(existing.getTimetableMaster().getId(),
                    dto.getDayOfWeek(), dto.getSlotLabel(), existing.getTenantId())) {
                throw new ResourceAlreadyExistException(dto.getSlotLabel(), "Timetable Slot", "label");
            }
        }

        existing.setDayOfWeek(dto.getDayOfWeek());
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());
        existing.setSlotLabel(dto.getSlotLabel());
        existing.setPeriodNumber(dto.getPeriodNumber());

        // If updating master parent
        if (!existing.getTimetableMaster().getId().equals(dto.getTimetableMasterId())) {
            ImsTimetableMasters master = masterRepo.findById(dto.getTimetableMasterId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Timetable Master ID", dto.getTimetableMasterId()));
            existing.setTimetableMaster(master);
        }

        return toDto(repo.save(existing));
    }

    @Override
    public ImsTimetableSlotsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Slot ID", id));
    }

    @Override
    public List<ImsTimetableSlotsDto> getByTimetableMasterId(String timetableMasterId) {
        return repo.findByTimetableMasterId(timetableMasterId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsTimetableSlotsDto> getByTenantId(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Timetable Slot ID", id);
        }
        repo.deleteById(id);
    }
}
