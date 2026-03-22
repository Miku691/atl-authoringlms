package com.ims.academic.service;

import com.ims.academic.dto.bootstrap.BootstrapReqDto;

public interface ImsBootstrapService {
    boolean bootstrapTenant(BootstrapReqDto reqDto);

    boolean isSetupComplete(String tenantId);

    void bootstrapSubjects(String tenantId);
    void bootstrapGradingScales(String tenantId);
    void bootstrapDepartments(String tenantId);
    java.util.Map<String, Boolean> getBulkSetupStatus(String tenantId);
}
