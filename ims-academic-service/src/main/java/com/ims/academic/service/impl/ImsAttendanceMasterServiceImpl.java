package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsAttendanceMasterDto;
import com.ims.academic.entity.ImsAttendanceMaster;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAttendanceMasterRepo;
import com.ims.academic.service.ImsAttendanceMasterService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAttendanceMasterServiceImpl implements ImsAttendanceMasterService {

    private final ImsAttendanceMasterRepo repo;
    private final ModelMapper modelMapper;

    private ImsAttendanceMasterDto toDto(ImsAttendanceMaster entity) {
        return modelMapper.map(entity, ImsAttendanceMasterDto.class);
    }

    private ImsAttendanceMaster toEntity(ImsAttendanceMasterDto dto) {
        return modelMapper.map(dto, ImsAttendanceMaster.class);
    }

    @Override
    @Transactional
    public ImsAttendanceMasterDto create(ImsAttendanceMasterDto dto) {
        ImsAttendanceMaster entity = toEntity(dto);

        if (entity.getRecords() != null) {
            entity.getRecords().forEach(record -> record.setAttendanceMaster(entity));
        }

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsAttendanceMasterDto update(String id, ImsAttendanceMasterDto dto) {
        ImsAttendanceMaster existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Master ID", id));

        existing.setOfferingId(dto.getOfferingId());
        existing.setDate(dto.getDate());
        existing.setStatus(dto.getStatus());
        existing.setTakenBy(dto.getTakenBy());
        existing.setNotes(dto.getNotes());

        // Simple update logic for base fields. Child record updates handled separately
        // or via replace if needed logic added.

        return toDto(repo.save(existing));
    }

    @Override
    public ImsAttendanceMasterDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Master ID", id));
    }

    @Override
    public List<ImsAttendanceMasterDto> getByOfferingId(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsAttendanceMasterDto> getByOfferingIdAndDate(String offeringId, LocalDate date) {
        return repo.findByOfferingIdAndDate(offeringId, date)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Attendance Master ID", id);
        }
        repo.deleteById(id);
    }
}
