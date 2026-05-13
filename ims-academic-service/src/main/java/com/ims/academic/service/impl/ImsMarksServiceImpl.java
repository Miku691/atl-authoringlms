package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsMarksRecordDto;
import com.ims.academic.entity.GradingScale;
import com.ims.academic.entity.ImsExamMaster;
import com.ims.academic.entity.ImsExamSchedule;
import com.ims.academic.entity.ImsMarksRecord;
import com.ims.academic.repo.GradingScaleRepo;
import com.ims.academic.repo.ImsExamMasterRepo;
import com.ims.academic.repo.ImsExamScheduleRepo;
import com.ims.academic.repo.ImsMarksRecordRepo;
import com.ims.academic.service.ImsMarksService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsMarksServiceImpl implements ImsMarksService {

    private final ImsMarksRecordRepo marksRepo;
    private final ImsExamScheduleRepo scheduleRepo;
    private final ImsExamMasterRepo examMasterRepo;
    private final GradingScaleRepo gradingScaleRepo;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void saveBulkMarks(String examScheduleId, List<ImsMarksRecordDto> marksList, String tenantId) {
        for (ImsMarksRecordDto dto : marksList) {
            Optional<ImsMarksRecord> existing = marksRepo.findByExamScheduleIdAndStudentId(examScheduleId,
                    dto.getStudentId());

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
        List<ImsMarksRecord> records = marksRepo.findByExamScheduleId(examScheduleId);
        if (records.isEmpty())
            return List.of();

        String tenantId = records.get(0).getTenantId();
        List<GradingScale> scales = gradingScaleRepo.findByTenantId(tenantId);

        Optional<ImsExamSchedule> scheduleOpt = scheduleRepo.findById(examScheduleId);
        Double maxMarks = scheduleOpt.map(ImsExamSchedule::getMaxMarks).orElse(100.0);

        return records.stream()
                .map(m -> mapToDtoWithGrade(m, scales, maxMarks))
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsMarksRecordDto> getResultsByStudent(String studentId, String tenantId) {
        List<ImsMarksRecord> records = marksRepo.findByStudentIdAndTenantId(studentId, tenantId);
        if (records.isEmpty())
            return List.of();

        List<GradingScale> scales = gradingScaleRepo.findByTenantId(tenantId);

        List<String> scheduleIds = records.stream().map(ImsMarksRecord::getExamScheduleId).collect(Collectors.toList());
        Map<String, ImsExamSchedule> scheduleMap = scheduleRepo.findAllById(scheduleIds)
                .stream().collect(Collectors.toMap(ImsExamSchedule::getId, s -> s));

        List<String> masterIds = scheduleMap.values().stream().map(ImsExamSchedule::getExamMasterId).distinct()
                .collect(Collectors.toList());
        Map<String, ImsExamMaster> masterMap = examMasterRepo.findAllById(masterIds)
                .stream().collect(Collectors.toMap(ImsExamMaster::getId, m -> m));

        return records.stream()
                .filter(m -> {
                    ImsExamSchedule schedule = scheduleMap.get(m.getExamScheduleId());
                    if (schedule == null)
                        return false;
                    ImsExamMaster master = masterMap.get(schedule.getExamMasterId());
                    return master != null && master.isPublished();
                })
                .map(m -> {
                    ImsExamSchedule schedule = scheduleMap.get(m.getExamScheduleId());
                    Double maxMarks = schedule != null ? schedule.getMaxMarks() : 100.0;
                    return mapToDtoWithGrade(m, scales, maxMarks);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ImsMarksRecordDto saveIndividualMark(ImsMarksRecordDto markDto) {
        Optional<ImsMarksRecord> existing = marksRepo.findByExamScheduleIdAndStudentId(markDto.getExamScheduleId(),
                markDto.getStudentId());

        ImsMarksRecord entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setMarksObtained(markDto.getMarksObtained());
            entity.setAbsent(markDto.isAbsent());
            entity.setRemarks(markDto.getRemarks());
        } else {
            entity = modelMapper.map(markDto, ImsMarksRecord.class);
        }
        ImsMarksRecord saved = marksRepo.save(entity);

        List<GradingScale> scales = gradingScaleRepo.findByTenantId(saved.getTenantId());
        Optional<ImsExamSchedule> scheduleOpt = scheduleRepo.findById(saved.getExamScheduleId());
        Double maxMarks = scheduleOpt.map(ImsExamSchedule::getMaxMarks).orElse(100.0);

        return mapToDtoWithGrade(saved, scales, maxMarks);
    }

    private ImsMarksRecordDto mapToDtoWithGrade(ImsMarksRecord record, List<GradingScale> scales, Double maxMarks) {
        ImsMarksRecordDto dto = modelMapper.map(record, ImsMarksRecordDto.class);
        if (record.isAbsent() || record.getMarksObtained() == null || maxMarks == null || maxMarks == 0) {
            return dto;
        }

        double percentage = (record.getMarksObtained() / maxMarks) * 100;

        for (GradingScale scale : scales) {
            if (percentage >= scale.getMinPercentage() && percentage <= scale.getMaxPercentage()) {
                dto.setGradeLabel(scale.getGradeLabel());
                dto.setGradePoint(scale.getGradePoint());
                break;
            }
        }
        return dto;
    }
}
