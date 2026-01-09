package com.ims.academic.service;

import com.ims.academic.dto.AcademicReadinessDto;

public interface AcademicReadinessService {

    AcademicReadinessDto checkReadiness(String tenantId);
}
