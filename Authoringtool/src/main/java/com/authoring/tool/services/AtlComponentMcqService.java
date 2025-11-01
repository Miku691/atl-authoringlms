package com.authoring.tool.services;

import com.authoring.tool.dto.AtlComponentMcqDto;
import com.authoring.tool.dto.custom.AtlMcqDto;

public interface AtlComponentMcqService {
    AtlComponentMcqDto saveMcqId(AtlComponentMcqDto mcqDto);
    AtlComponentMcqDto getMcqData(Long id);
}
