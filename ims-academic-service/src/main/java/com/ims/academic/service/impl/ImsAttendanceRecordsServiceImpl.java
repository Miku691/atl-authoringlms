package com.ims.academic.service.impl;

import com.ims.academic.dto.AttendanceSummaryDto;
import com.ims.academic.dto.ImsAttendanceRecordsDto;
import com.ims.academic.entity.ImsAttendanceMaster;
import com.ims.academic.entity.ImsAttendanceRecords;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAttendanceMasterRepo;
import com.ims.academic.repo.ImsAttendanceRecordsRepo;
import com.ims.academic.service.ImsAttendanceRecordsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAttendanceRecordsServiceImpl implements ImsAttendanceRecordsService {

    private final ImsAttendanceRecordsRepo repo;
    private final ImsAttendanceMasterRepo masterRepo;
    private final ModelMapper modelMapper;

    private ImsAttendanceRecordsDto toDto(ImsAttendanceRecords entity) {
        ImsAttendanceRecordsDto dto = modelMapper.map(entity, ImsAttendanceRecordsDto.class);
        if (entity.getAttendanceMaster() != null) {
            dto.setAttendanceMasterId(entity.getAttendanceMaster().getId());
        }
        return dto;
    }

    private ImsAttendanceRecords toEntity(ImsAttendanceRecordsDto dto) {
        return modelMapper.map(dto, ImsAttendanceRecords.class);
    }

    @Override
    @Transactional
    public ImsAttendanceRecordsDto create(ImsAttendanceRecordsDto dto) {
        ImsAttendanceRecords entity = toEntity(dto);

        ImsAttendanceMaster master = masterRepo.findById(dto.getAttendanceMasterId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Master ID", dto.getAttendanceMasterId()));
        entity.setAttendanceMaster(master);

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsAttendanceRecordsDto update(String id, ImsAttendanceRecordsDto dto) {
        ImsAttendanceRecords existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Record ID", id));

        existing.setPersonId(dto.getPersonId());
        existing.setPersonType(dto.getPersonType());
        existing.setStatus(dto.getStatus());
        existing.setRemarks(dto.getRemarks());

        if (!existing.getAttendanceMaster().getId().equals(dto.getAttendanceMasterId())) {
            ImsAttendanceMaster master = masterRepo.findById(dto.getAttendanceMasterId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Attendance Master ID", dto.getAttendanceMasterId()));
            existing.setAttendanceMaster(master);
        }

        return toDto(repo.save(existing));
    }

    @Override
    public ImsAttendanceRecordsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Record ID", id));
    }

    @Override
    public List<ImsAttendanceRecordsDto> getByAttendanceMasterId(String attendanceMasterId) {
        return repo.findByAttendanceMasterId(attendanceMasterId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Attendance Record ID", id);
        }
        repo.deleteById(id);
    }

    @Override
    public AttendanceSummaryDto getSummaryByStudentId(String studentId) {
        long totalDays = repo.countByPersonId(studentId);
        long presentDays = repo.countByPersonIdAndStatus(studentId, com.ims.academic.enums.AttendanceStatus.PRESENT);
        return AttendanceSummaryDto.builder()
                .totalDays(totalDays)
                .presentDays(presentDays)
                .build();
    }
}
