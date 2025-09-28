package com.authoring.tool.service.impl;

import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.authoring.tool.dto.AtlComponentStylesDto;
import com.authoring.tool.entity.AtlComponentStyles;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlComponentStylesRepo;
import com.authoring.tool.services.impl.AtlComponentStylesServiceImpl;

@ExtendWith(MockitoExtension.class)
public class AtlComponentStylesServiceImplTest {
	
	@Mock
	AtlComponentStylesRepo styleRepo;
	@Mock
	ModelMapper modelMapper;
	@InjectMocks
	AtlComponentStylesServiceImpl styleObj;
	
	@Test
	void getStyleJsonSuccess() {
		Long id = 1l;
		AtlComponentStylesDto styleDto = new AtlComponentStylesDto();
		styleDto.setId(id);
		styleDto.setComponentType("PDF");
		AtlComponentStyles styleEntity = new AtlComponentStyles();
		styleEntity.setId(id);
		styleEntity.setComponentType("PDF");
		//Optional<AtlComponentStyles> optionalEntity = ;
		
		Mockito.when(styleRepo.findById(id)).thenReturn(Optional.of(styleEntity));
		Mockito.when(modelMapper.map(styleEntity, AtlComponentStylesDto.class)).thenReturn(styleDto);
		
		AtlComponentStylesDto returnedDto = styleObj.getStyleJson(id);
		
		Assertions.assertEquals(styleDto.getId(), returnedDto.getId());
		Assertions.assertEquals(styleDto.getComponentType(), returnedDto.getComponentType());
	}
	
	//@DisplayName("Save the style json object")
	@Test
	void saveStyleJsonSuccess() {
		AtlComponentStylesDto styleJsonDto = new AtlComponentStylesDto();
		styleJsonDto.setId(1l);
		styleJsonDto.setComponentType("HEADING");
		AtlComponentStyles styleJson = new AtlComponentStyles();
		styleJson.setId(1l);
		styleJson.setComponentType("HEADING");
		
		Mockito.when(modelMapper.map(styleJsonDto, AtlComponentStyles.class)).thenReturn(styleJson);
		Mockito.when(styleRepo.save(styleJson)).thenReturn(styleJson);
		Mockito.when(modelMapper.map(styleJson, AtlComponentStylesDto.class)).thenReturn(styleJsonDto);
		
		
		AtlComponentStylesDto returnedDto = styleObj.saveStyleJson(styleJsonDto);
		
		Assertions.assertEquals(styleJsonDto.getId(), returnedDto.getId());
		Assertions.assertEquals(styleJsonDto.getComponentType(), returnedDto.getComponentType());
	}
	
	@Test
	void getJsonStyleThorwsExceptionOnDataNotAvailable() {
		AtlComponentStyles styleEntity = new AtlComponentStyles();
		styleEntity.setId(1l);
		styleEntity.setComponentType("PDF");
		
		Mockito.when(styleRepo.findById(1l)).thenReturn(Optional.empty());
		
		 
		//testing exception 
		DetailsNotFoundException runtimeException = Assertions.assertThrows(
				DetailsNotFoundException.class, () -> {
			styleObj.getStyleJson(1l);
		});
		
		Assertions.assertEquals("Details Not found for: ID - 1", runtimeException.getMessage());
		
	}
}
