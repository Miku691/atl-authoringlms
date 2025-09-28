package com.authoring.tool.services.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlMediaAssestsDto;
import com.authoring.tool.entity.AtlComponentTracking;
import com.authoring.tool.entity.AtlMediaAssests;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentTrackingRepo;
import com.authoring.tool.repo.AtlMediaAssestsRepo;
import com.authoring.tool.services.AtlMediaAssestsService;
import com.authoring.tool.utility.ApplicationConstant;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtlMediaAssestsServiceImpl implements AtlMediaAssestsService{

	private final ModelMapper modelMapper;
	private final AtlMediaAssestsRepo assestsRepo;
	
	@Override
	@Transactional
	public AtlMediaAssestsDto saveMediaAssest(AtlMediaAssestsDto mediaAsset) {
		AtlMediaAssests mediaAssetSaved = assestsRepo.save(modelMapper.map(mediaAsset, AtlMediaAssests.class));
		return modelMapper.map(mediaAssetSaved, AtlMediaAssestsDto.class);
	}

	@Override
	public AtlMediaAssestsDto fetchMediaAssest(Long id) {
		AtlMediaAssests mediaAsset = assestsRepo.findById(id).orElseThrow(() -> new DetailsNotFoundException("ID", id.toString()));
		return modelMapper.map(mediaAsset, AtlMediaAssestsDto.class);
	}

}
