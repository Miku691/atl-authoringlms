package com.authoring.tool.services.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlComponentTrackingDto;
import com.authoring.tool.entity.AtlComponentTracking;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentTrackingRepo;
import com.authoring.tool.services.AtlComponentTrackingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtlComponentTrackingServiceImpl implements AtlComponentTrackingService{

	private final AtlComponentTrackingRepo trackingRepo;
	private final ModelMapper modelMapper;
	
	@Override
	public AtlComponentTrackingDto saveComponentTracking(AtlComponentTrackingDto dto) {
		AtlComponentTracking savedData = trackingRepo.save(modelMapper.map(dto, AtlComponentTracking.class));
		return modelMapper.map(savedData, AtlComponentTrackingDto.class);
	}

	@Override
	public AtlComponentTrackingDto getComponentTracking(Long id) {
		AtlComponentTracking trackingObj = trackingRepo.findById(id).orElseThrow(() -> new DetailsNotFoundException("ID", id.toString()));
		return modelMapper.map(trackingObj, AtlComponentTrackingDto.class);
	}

}
