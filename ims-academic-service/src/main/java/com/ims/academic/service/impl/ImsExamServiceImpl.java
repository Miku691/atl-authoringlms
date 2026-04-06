package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsExamMasterDto;
import com.ims.academic.dto.ImsExamScheduleDto;
import com.ims.academic.entity.ImsExamMaster;
import com.ims.academic.entity.ImsExamSchedule;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsExamMasterRepo;
import com.ims.academic.repo.ImsExamScheduleRepo;
import com.ims.academic.service.ImsExamService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsExamServiceImpl implements ImsExamService {

    private final ImsExamMasterRepo examRepo;
    private final ImsExamScheduleRepo scheduleRepo;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ImsExamMasterDto createExam(ImsExamMasterDto examDto) {
        ImsExamMaster entity = modelMapper.map(examDto, ImsExamMaster.class);
        return modelMapper.map(examRepo.save(entity), ImsExamMasterDto.class);
    }

    @Override
    @Transactional
    public ImsExamMasterDto updateExam(String id, ImsExamMasterDto examDto) {
        ImsExamMaster existing = examRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam ID", id));
        
        existing.setExamName(examDto.getExamName());
        existing.setExamType(examDto.getExamType());
        existing.setDescription(examDto.getDescription());
        existing.setPublished(examDto.isPublished());
        
        return modelMapper.map(examRepo.save(existing), ImsExamMasterDto.class);
    }

    @Override
    @Transactional
    public void deleteExam(String id) {
        if (!examRepo.existsById(id)) {
            throw new ResourceNotFoundException("Exam ID", id);
        }
        // Also delete related schedules
        List<ImsExamSchedule> schedules = scheduleRepo.findByExamMasterId(id);
        scheduleRepo.deleteAll(schedules);
        examRepo.deleteById(id);
    }

    @Override
    public ImsExamMasterDto getExamById(String id) {
        return examRepo.findById(id)
                .map(e -> modelMapper.map(e, ImsExamMasterDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Exam ID", id));
    }

    @Override
    public List<ImsExamMasterDto> getExamsBySession(String tenantId, String sessionId) {
        return examRepo.findByTenantIdAndAcademicSessionIdOrderByExamName(tenantId, sessionId)
                .stream()
                .map(e -> modelMapper.map(e, ImsExamMasterDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void publishResults(String examMasterId, boolean isPublished) {
        ImsExamMaster exam = examRepo.findById(examMasterId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam ID", examMasterId));
        exam.setPublished(isPublished);
        examRepo.save(exam);
    }

    @Override
    @Transactional
    public ImsExamScheduleDto createSchedule(ImsExamScheduleDto scheduleDto) {
        ImsExamSchedule entity = modelMapper.map(scheduleDto, ImsExamSchedule.class);
        return modelMapper.map(scheduleRepo.save(entity), ImsExamScheduleDto.class);
    }

    @Override
    public List<ImsExamScheduleDto> getSchedulesByExam(String examMasterId) {
        return scheduleRepo.findByExamMasterId(examMasterId)
                .stream()
                .map(s -> modelMapper.map(s, ImsExamScheduleDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsExamScheduleDto> getSchedulesByOffering(String offeringId, String tenantId) {
        return scheduleRepo.findByOfferingIdAndTenantId(offeringId, tenantId)
                .stream()
                .map(s -> modelMapper.map(s, ImsExamScheduleDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSchedule(String scheduleId) {
        if (!scheduleRepo.existsById(scheduleId)) {
            throw new ResourceNotFoundException("Schedule ID", scheduleId);
        }
        scheduleRepo.deleteById(scheduleId);
    }
}
