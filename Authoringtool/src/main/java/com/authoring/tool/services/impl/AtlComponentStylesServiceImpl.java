package com.authoring.tool.services.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlComponentStylesDto;
import com.authoring.tool.entity.AtlComponentStyles;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentStylesRepo;
import com.authoring.tool.services.AtlComponentStylesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtlComponentStylesServiceImpl implements AtlComponentStylesService{
	private final AtlComponentStylesRepo styleRepo;
	private final ModelMapper modelMapper;
	
	@Override
	public AtlComponentStylesDto saveStyleJson(AtlComponentStylesDto styleDto) {
		AtlComponentStyles styleSaved = styleRepo.save(modelMapper.map(styleDto, AtlComponentStyles.class));
		return modelMapper.map(styleSaved, AtlComponentStylesDto.class);
	}

	@Override
	public AtlComponentStylesDto getStyleJson(Long id) {
		AtlComponentStyles styleObj = styleRepo.findById(id).orElseThrow(() -> new DetailsNotFoundException("ID", id.toString()));
		return modelMapper.map(styleObj, AtlComponentStylesDto.class);
	}

}
