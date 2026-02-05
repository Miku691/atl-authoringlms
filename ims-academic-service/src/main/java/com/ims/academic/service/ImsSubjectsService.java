package com.ims.academic.service;

import com.ims.academic.dto.MessageDto;
import com.ims.academic.dto.SubjectRequestDto;
import com.ims.academic.dto.SubjectResponseDto;

import java.util.List;

public interface ImsSubjectsService {

    MessageDto createSubject(String tenantId, SubjectRequestDto dto);

    List<SubjectResponseDto> getAllSubjects(String tenantId);

    MessageDto deleteSubject(String tenantId, String subjectId);
}
