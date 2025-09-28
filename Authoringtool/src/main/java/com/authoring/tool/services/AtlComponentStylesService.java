package com.authoring.tool.services;

import com.authoring.tool.dto.AtlComponentStylesDto;

public interface AtlComponentStylesService {
	AtlComponentStylesDto saveStyleJson(AtlComponentStylesDto styleDto);
	AtlComponentStylesDto getStyleJson(Long id);
}
