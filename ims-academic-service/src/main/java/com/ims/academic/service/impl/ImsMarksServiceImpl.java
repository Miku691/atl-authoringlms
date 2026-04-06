package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsMarksRecordDto;
import com.ims.academic.entity.ImsMarksRecord;
import com.ims.academic.repo.ImsMarksRecordRepo;
import com.ims.academic.service.ImsMarksService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsMarksServiceImpl implements ImsMarksService {

    private final ImsMarksRecordRepo marksRepo;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void saveBulkMarks(String examScheduleId, List<ImsMarksRecordDto> marksList, String tenantId) {
        for (ImsMarksRecordDto dto : marksList) {
            Optional<ImsMarksRecord> existing = marksRepo.findByExamScheduleIdAndStudentId(examScheduleId, dto.getStudentId());
            
            ImsMarksRecord entity;
            if (existing.isPresent()) {
                entity = existing.get();
                entity.setMarksObtained(dto.getMarksObtained());
                entity.setAbsent(dto.isAbsent());
                entity.setRemarks(dto.getRemarks());
            } else {
                entity = modelMapper.map(dto, ImsMarksRecord.class);
                entity.setExamScheduleId(examScheduleId);
                entity.setTenantId(tenantId);
            }
            marksRepo.save(entity);
        }
    }

    @Override
    public List<ImsMarksRecordDto> getMarksBySchedule(String examScheduleId) {
        return marksRepo.findByExamScheduleId(examScheduleId)
                .stream()
                .map(m -> modelMapper.map(m, ImsMarksRecordDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsMarksRecordDto> getResultsByStudent(String studentId, String tenantId) {
        return marksRepo.findByStudentIdAndTenantId(studentId, tenantId)
                .stream()
                .map(m -> modelMapper.map(m, ImsMarksRecordDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ImsMarksRecordDto saveIndividualMark(ImsMarksRecordDto markDto) {
        Optional<ImsMarksRecord> existing = marksRepo.findByExamScheduleIdAndStudentId(markDto.getExamScheduleId(), markDto.getStudentId());
        
        ImsMarksRecord entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setMarksObtained(markDto.getMarksObtained());
            entity.setAbsent(markDto.isAbsent());
            entity.setRemarks(markDto.getRemarks());
        } else {
            entity = modelMapper.map(markDto, ImsMarksRecord.class);
        }
        return modelMapper.map(marksRepo.save(entity), ImsMarksRecordDto.class);
    }
}
