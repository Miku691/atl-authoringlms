package com.ims.academic.service;

import com.ims.academic.dto.ImsYearsDto;
import java.util.List;

public interface ImsYearsService {
    ImsYearsDto create(ImsYearsDto dto);
    List<ImsYearsDto> getByTenantId(String tenantId);
    List<ImsYearsDto> getByBranchId(String tenantId, String branchId);
}
