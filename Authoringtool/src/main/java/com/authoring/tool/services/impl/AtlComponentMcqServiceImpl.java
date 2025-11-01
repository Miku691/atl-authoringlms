package com.authoring.tool.services.impl;

import com.authoring.tool.dto.AtlComponentMcqDto;
import com.authoring.tool.entity.AtlComponentMcq;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentMcqRepo;
import com.authoring.tool.services.AtlComponentMcqService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtlComponentMcqServiceImpl implements AtlComponentMcqService {
    private final AtlComponentMcqRepo mcqRepo;
    private final ModelMapper modelMapper;
    @Override
    public AtlComponentMcqDto saveMcqId(AtlComponentMcqDto mcqDto) {
        AtlComponentMcq mcqIdObj = mcqRepo.save(modelMapper.map(mcqDto, AtlComponentMcq.class));
        return modelMapper.map(mcqIdObj, AtlComponentMcqDto.class);
    }

    @Override
    public AtlComponentMcqDto getMcqData(Long id) {
        AtlComponentMcq mcqObj = mcqRepo.findById(id).orElseThrow(() -> new DetailsNotFoundException("id", id.toString()));
        return modelMapper.map(mcqObj, AtlComponentMcqDto.class);
    }
}
