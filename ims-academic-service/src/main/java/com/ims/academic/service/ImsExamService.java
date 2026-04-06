package com.ims.academic.service;

import com.ims.academic.dto.ImsExamMasterDto;
import com.ims.academic.dto.ImsExamScheduleDto;

import java.util.List;

public interface ImsExamService {

    // Exam Master Management
    ImsExamMasterDto createExam(ImsExamMasterDto examDto);
    ImsExamMasterDto updateExam(String id, ImsExamMasterDto examDto);
    void deleteExam(String id);
    ImsExamMasterDto getExamById(String id);
    List<ImsExamMasterDto> getExamsBySession(String tenantId, String sessionId);
    void publishResults(String examMasterId, boolean isPublished);

    // Exam Schedule Management
    ImsExamScheduleDto createSchedule(ImsExamScheduleDto scheduleDto);
    List<ImsExamScheduleDto> getSchedulesByExam(String examMasterId);
    List<ImsExamScheduleDto> getSchedulesByOffering(String offeringId, String tenantId);
    void deleteSchedule(String scheduleId);
}
