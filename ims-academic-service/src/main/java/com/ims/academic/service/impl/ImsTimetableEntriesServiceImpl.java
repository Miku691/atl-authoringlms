package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsTimetableEntriesDto;
import com.ims.academic.entity.ImsTimetableEntries;
import com.ims.academic.entity.ImsTimetableSlots;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsSubjectsRepo;
import com.ims.academic.repo.ImsTimetableEntriesRepo;
import com.ims.academic.repo.ImsTimetableSlotsRepo;
import com.ims.academic.service.ImsTimetableEntriesService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ims.academic.dto.ImsTimetableSlotsDto;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTimetableEntriesServiceImpl implements ImsTimetableEntriesService {

    private final ImsTimetableEntriesRepo repo;
    private final ImsTimetableSlotsRepo slotRepo;
    private final ImsOfferingsRepo offeringsRepo;
    private final ImsSubjectsRepo subjectsRepo;
    private final ModelMapper modelMapper;

    private ImsTimetableEntriesDto toDto(ImsTimetableEntries entity) {
        // Map entity to DTO
        ImsTimetableEntriesDto dto = modelMapper.map(entity, ImsTimetableEntriesDto.class);
        // Manually set parent ID as ModelMapper might not auto-resolve from lazy loaded
        // parent
        if (entity.getTimetableSlot() != null) {
            dto.setTimetableSlotId(entity.getTimetableSlot().getId());
            dto.setSlotDetails(modelMapper.map(entity.getTimetableSlot(), ImsTimetableSlotsDto.class));
        }

        // Enrich with names
        offeringsRepo.findById(entity.getOfferingId()).ifPresent(o -> dto.setOfferingName(o.getName()));
        subjectsRepo.findById(entity.getSubjectId()).ifPresent(s -> dto.setSubjectName(s.getTitle()));

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

        if (repo.existsByTimetableSlotIdAndOfferingIdAndSubjectIdAndInstructorIdAndTenantId(dto.getTimetableSlotId(),
                dto.getOfferingId(), dto.getSubjectId(), dto.getInstructorId(), dto.getTenantId())) {
            throw new ResourceAlreadyExistException(dto.getSubjectId(), "Timetable Entry", "duplicate assignment");
        }

        // Check for cross-class instructor conflict
        if (repo.isInstructorBusy(dto.getInstructorId(), slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime(),
                null)) {
            throw new ResourceAlreadyExistException(dto.getInstructorId(), "Instructor",
                    "already assigned to another class at this time");
        }

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsTimetableEntriesDto update(String id, ImsTimetableEntriesDto dto) {
        ImsTimetableEntries existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Entry ID", id));

        // Check duplicate on update if key fields changed
        if (!existing.getSubjectId().equals(dto.getSubjectId()) ||
                !existing.getInstructorId().equals(dto.getInstructorId()) ||
                !existing.getTimetableSlot().getId().equals(dto.getTimetableSlotId())) {

            if (repo.existsByTimetableSlotIdAndOfferingIdAndSubjectIdAndInstructorIdAndTenantId(
                    dto.getTimetableSlotId(),
                    dto.getOfferingId(), dto.getSubjectId(), dto.getInstructorId(), existing.getTenantId())) {
                throw new ResourceAlreadyExistException(dto.getSubjectId(), "Timetable Entry", "duplicate assignment");
            }
        }

        // Resolve slot for conflict check
        ImsTimetableSlots slot = slotRepo.findById(dto.getTimetableSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Slot ID", dto.getTimetableSlotId()));

        // Check for cross-class instructor conflict
        if (repo.isInstructorBusy(dto.getInstructorId(), slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime(),
                id)) {
            throw new ResourceAlreadyExistException(dto.getInstructorId(), "Instructor",
                    "already assigned to another class at this time");
        }

        // Update fields
        existing.setOfferingId(dto.getOfferingId());
        existing.setSubjectId(dto.getSubjectId());
        existing.setInstructorId(dto.getInstructorId());
        existing.setRoom(dto.getRoom());

        // Update parent if changed
        if (!existing.getTimetableSlot().getId().equals(dto.getTimetableSlotId())) {
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
    public List<ImsTimetableEntriesDto> getByInstructorId(String instructorId) {
        return repo.findByInstructorId(instructorId)
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
