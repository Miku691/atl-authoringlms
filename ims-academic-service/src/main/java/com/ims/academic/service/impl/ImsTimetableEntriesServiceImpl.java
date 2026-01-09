package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsTimetableEntriesDto;
import com.ims.academic.entity.ImsTimetableEntries;
import com.ims.academic.entity.ImsTimetableSlots;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsTimetableEntriesRepo;
import com.ims.academic.repo.ImsTimetableSlotsRepo;
import com.ims.academic.service.ImsTimetableEntriesService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTimetableEntriesServiceImpl implements ImsTimetableEntriesService {

    private final ImsTimetableEntriesRepo repo;
    private final ImsTimetableSlotsRepo slotRepo;
    private final ModelMapper modelMapper;

    private ImsTimetableEntriesDto toDto(ImsTimetableEntries entity) {
        // Map entity to DTO
        ImsTimetableEntriesDto dto = modelMapper.map(entity, ImsTimetableEntriesDto.class);
        // Manually set parent ID as ModelMapper might not auto-resolve from lazy loaded
        // parent
        if (entity.getTimetableSlot() != null) {
            dto.setTimetableSlotId(entity.getTimetableSlot().getId());
        }
        return dto;
    }

    private ImsTimetableEntries toEntity(ImsTimetableEntriesDto dto) {
        return modelMapper.map(dto, ImsTimetableEntries.class);
    }

    @Override
    @Transactional
    public ImsTimetableEntriesDto create(ImsTimetableEntriesDto dto) {
        ImsTimetableEntries entity = toEntity(dto);

        // Resolve parent
        ImsTimetableSlots slot = slotRepo.findById(dto.getTimetableSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Slot ID", dto.getTimetableSlotId()));
        entity.setTimetableSlot(slot);

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsTimetableEntriesDto update(String id, ImsTimetableEntriesDto dto) {
        ImsTimetableEntries existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Entry ID", id));

        // Update fields
        existing.setOfferingId(dto.getOfferingId());
        existing.setSubjectId(dto.getSubjectId());
        existing.setInstructorId(dto.getInstructorId());
        existing.setRoom(dto.getRoom());

        // Update parent if changed
        if (!existing.getTimetableSlot().getId().equals(dto.getTimetableSlotId())) {
            ImsTimetableSlots slot = slotRepo.findById(dto.getTimetableSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Timetable Slot ID", dto.getTimetableSlotId()));
            existing.setTimetableSlot(slot);
        }

        return toDto(repo.save(existing));
    }

    @Override
    public ImsTimetableEntriesDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Entry ID", id));
    }

    @Override
    public List<ImsTimetableEntriesDto> getByTimetableSlotId(String timetableSlotId) {
        return repo.findByTimetableSlotId(timetableSlotId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Timetable Entry ID", id);
        }
        repo.deleteById(id);
    }
}
