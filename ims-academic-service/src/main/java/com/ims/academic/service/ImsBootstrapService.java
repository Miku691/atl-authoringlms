package com.ims.academic.service;

import com.ims.academic.dto.bootstrap.BootstrapReqDto;

public interface ImsBootstrapService {
    boolean bootstrapTenant(BootstrapReqDto reqDto);

    boolean isSetupComplete(String tenantId);
}
