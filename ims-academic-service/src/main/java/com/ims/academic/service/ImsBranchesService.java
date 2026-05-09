package com.ims.academic.service;

import com.ims.academic.dto.ImsBranchesDto;
import java.util.List;

public interface ImsBranchesService {
    ImsBranchesDto create(ImsBranchesDto dto);
    List<ImsBranchesDto> getByTenantId(String tenantId);
    List<ImsBranchesDto> getByProgramId(String tenantId, String programId);
}
