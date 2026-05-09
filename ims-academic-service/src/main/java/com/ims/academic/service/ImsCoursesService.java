package com.ims.academic.service;

import com.ims.academic.dto.ImsCoursesDto;
import java.util.List;

public interface ImsCoursesService {
    ImsCoursesDto create(ImsCoursesDto dto);
    List<ImsCoursesDto> getByTenantId(String tenantId);
    List<ImsCoursesDto> getByProgramId(String tenantId, String programId);
}
