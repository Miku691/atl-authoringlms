package com.authoring.tool.services.impl;

import org.modelmapper.ModelMapper;

import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlComponentHeadingDto;
import com.authoring.tool.dto.AtlHeadingWOSlideDto;
import com.authoring.tool.entity.AtlComponentHeading;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentHeadingRepo;
import com.authoring.tool.services.AtlComponentHeadingService;


import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AtlComponentHeadingServiceImpl implements AtlComponentHeadingService{
	private final ModelMapper modelMapper;
	private final AtlComponentHeadingRepo headingRepo;
	
	@Override
	public AtlComponentHeadingDto saveComponentHeading(AtlComponentHeadingDto headingDto) {
		AtlComponentHeading savedHeading = headingRepo.save(modelMapper.map(headingDto, AtlComponentHeading.class));
		return modelMapper.map(savedHeading, AtlComponentHeadingDto.class);
	}

	@Override
	public AtlHeadingWOSlideDto getComponentHeading(Long headingId) {
		AtlComponentHeading headingObj = headingRepo.findById(headingId).orElseThrow(() -> new DetailsNotFoundException("headingId", headingId.toString()));

		return modelMapper.map(headingObj, AtlHeadingWOSlideDto.class);

	}

}
