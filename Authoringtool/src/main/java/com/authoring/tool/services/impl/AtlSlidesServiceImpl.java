package com.authoring.tool.services.impl;

import com.authoring.tool.dto.*;
import com.authoring.tool.dto.custom.AtlHeadingDto;
import com.authoring.tool.dto.custom.AtlMcqDto;
import com.authoring.tool.dto.custom.AtlTextDto;
import com.authoring.tool.entity.*;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentStylesRepo;
import com.authoring.tool.repo.AtlCourseRepo;
import com.authoring.tool.repo.AtlSlidesRepo;
import com.authoring.tool.services.AtlSlidesService;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AtlSlidesServiceImpl implements AtlSlidesService {
	private final AtlSlidesRepo slideRepo;
	private final AtlCourseRepo courseRepo;
	private final ModelMapper modelMapper;
	private final AtlComponentStylesRepo styleRepo;
	
	@Override
	public AtlSlidesDto saveSlide(AtlSlidesDto slideDto) {
		courseRepo.findById(slideDto.getCourse().getId()).orElseThrow(() -> new DetailsNotFoundException("Course ID", slideDto.getCourse().getId()+""));
		
		AtlSlides savedSlide = slideRepo.save(modelMapper.map(slideDto, AtlSlides.class));
		return modelMapper.map(savedSlide, AtlSlidesDto.class);
	}

	@Override
	public AtlSlidesWithComponentDto getSlideById(Long slideId) {
		AtlSlides slideObj = slideRepo.findById(slideId).orElseThrow(() -> new DetailsNotFoundException("slideId", slideId.toString()));
        List<AtlSlideComponentDto> componentDto = new ArrayList<>();

        for(AtlSlideComponent component : slideObj.getComponents()){
            Optional<AtlComponentStyles> compStyle = styleRepo.findByComponentId(component.getId());
            AtlComponentStylesDto compStyleDto = compStyle.map(atlComponentStyles -> modelMapper.map(atlComponentStyles, AtlComponentStylesDto.class)).orElse(null);

            if(component instanceof AtlComponentHeading){
                AtlHeadingDto dto = modelMapper.map(component, AtlHeadingDto.class);
                dto.setType("HEADING");
                dto.setJsonStyle(compStyleDto);
                componentDto.add(dto);
            }
            else if (component instanceof AtlComponentText) {
                AtlTextDto dto = modelMapper.map(component, AtlTextDto.class);
                dto.setType("TEXT");
                dto.setJsonStyle(compStyleDto);
                componentDto.add(dto);
            }
            else if(component instanceof AtlComponentMcq){
                AtlMcqDto mcqDto = modelMapper.map(component, AtlMcqDto.class);
                mcqDto.setType("MCQ");
                mcqDto.setJsonStyle(compStyleDto);
                componentDto.add(mcqDto);
            }
        }
        
        AtlSlidesWithComponentDto responseDto = new AtlSlidesWithComponentDto();
        responseDto.setId(slideObj.getId());
        responseDto.setDescription(slideObj.getDescription());
        responseDto.setTitle(slideObj.getTitle());
        responseDto.setOrderIndex(slideObj.getOrderIndex());
        responseDto.setComponents(componentDto);

        return responseDto;
	}

    @Override
    public AtlSlidesWithoutCourseDto updateSlideData(AtlSlidesDto updatedSlideDto) {
        AtlSlides slideObj = slideRepo.findById(updatedSlideDto.getId()).orElseThrow(() -> new DetailsNotFoundException("slideId", updatedSlideDto.getId().toString()));
        slideObj.setTitle(updatedSlideDto.getTitle());
        slideObj.setDescription(updatedSlideDto.getDescription());

        AtlSlides slideObjSaved = slideRepo.save(slideObj);
        return modelMapper.map(slideObjSaved, AtlSlidesWithoutCourseDto.class);
    }

}
