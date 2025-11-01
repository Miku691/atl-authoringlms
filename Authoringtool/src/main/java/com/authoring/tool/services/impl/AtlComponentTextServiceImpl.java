package com.authoring.tool.services.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlComponentTextDto;
import com.authoring.tool.entity.AtlComponentText;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentTextRepo;
import com.authoring.tool.services.AtlComponentTextService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AtlComponentTextServiceImpl implements AtlComponentTextService {
	private final AtlComponentTextRepo textRepo;
	private final ModelMapper modelMapper;
	
	@Override
	public AtlComponentTextDto saveTextData(AtlComponentTextDto textDtp) {
		AtlComponentText savedObj = textRepo.save(modelMapper.map(textDtp, AtlComponentText.class));
		return modelMapper.map(savedObj, AtlComponentTextDto.class);
	}

	@Override
	public AtlComponentTextDto getTextData(Long id) {
		AtlComponentText textObj = textRepo.findById(id).orElseThrow(() -> new DetailsNotFoundException("headingId", id.toString()));
		return modelMapper.map(textObj, AtlComponentTextDto.class);
	}

    @Override
    public AtlComponentTextDto updateTextData(AtlComponentTextDto textUpdateDto) {
        AtlComponentText textObj = textRepo.findById(textUpdateDto.getId()).orElseThrow(() -> new DetailsNotFoundException("headingId", textUpdateDto.getId().toString()));

        textObj.setText(textUpdateDto.getText());

        return modelMapper.map(textRepo.save(textObj), AtlComponentTextDto.class);
    }

}
