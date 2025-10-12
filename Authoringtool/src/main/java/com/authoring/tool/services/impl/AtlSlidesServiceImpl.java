package com.authoring.tool.services.impl;

import com.authoring.tool.dto.AtlComponentStylesDto;
import com.authoring.tool.dto.AtlSlideComponentDto;
import com.authoring.tool.dto.custom.AtlHeadingDto;
import com.authoring.tool.dto.custom.AtlTextDto;
import com.authoring.tool.entity.AtlComponentHeading;
import com.authoring.tool.entity.AtlComponentStyles;
import com.authoring.tool.entity.AtlComponentText;
import com.authoring.tool.entity.AtlSlideComponent;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlSlidesDto;
import com.authoring.tool.dto.AtlSlidesWithComponentDto;
import com.authoring.tool.entity.AtlSlides;
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
            if(component instanceof AtlComponentHeading){
            	//get JSON style for a component.
                Optional<AtlComponentStyles> compStyle = styleRepo.findByComponentId(component.getId());
                
                AtlHeadingDto dto = modelMapper.map(component, AtlHeadingDto.class);
                dto.setType("heading");
                if(compStyle.isPresent())
                	dto.setJsonStyle(modelMapper.map(compStyle, AtlComponentStylesDto.class));
                componentDto.add(dto);
            }
            else if (component instanceof AtlComponentText) {
            	//get JSON style for a component.
            	Optional<AtlComponentStyles> compStyle = styleRepo.findByComponentId(component.getId());
                
                AtlTextDto dto = modelMapper.map(component, AtlTextDto.class);
                dto.setType("text");
                if(compStyle.isPresent())
                	dto.setJsonStyle(modelMapper.map(compStyle, AtlComponentStylesDto.class));
                componentDto.add(dto);
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

}
