package com.authoring.tool.services;

import com.authoring.tool.dto.AtlComponentTrackingDto;

public interface AtlComponentTrackingService {
	AtlComponentTrackingDto saveComponentTracking(AtlComponentTrackingDto dto);
	AtlComponentTrackingDto getComponentTracking(Long id);
	
}
