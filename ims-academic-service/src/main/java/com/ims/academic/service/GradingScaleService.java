package com.ims.academic.service;

import com.ims.academic.dto.GradingScaleDto;
import com.ims.academic.dto.MessageDto;
import java.util.List;

public interface GradingScaleService {
    MessageDto createGradingScale(String tenantId, GradingScaleDto dto);

    List<GradingScaleDto> getGradingScales(String tenantId);

    MessageDto deleteGradingScale(String tenantId, String id);

    MessageDto updateGradingScale(String tenantId, String id, GradingScaleDto dto);
}
