package com.authoring.tool.services;

import com.authoring.tool.dto.AtlComponentTextDto;

public interface AtlComponentTextService {
	AtlComponentTextDto saveTextData(AtlComponentTextDto textDtp);
	AtlComponentTextDto getTextData(Long id);
}
