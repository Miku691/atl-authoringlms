package com.ims.academic.service;

import com.ims.academic.dto.AcademicSessionDto;
import java.util.List;

public interface AcademicSessionService {
    AcademicSessionDto create(AcademicSessionDto dto);

    AcademicSessionDto update(String id, AcademicSessionDto dto);

    AcademicSessionDto getById(String id);

    List<AcademicSessionDto> getByProgram(String programId);

    List<AcademicSessionDto> getByTenant(String tenantId);
    
    AcademicSessionDto updateStatus(String id, String status);

    void delete(String id);
}
