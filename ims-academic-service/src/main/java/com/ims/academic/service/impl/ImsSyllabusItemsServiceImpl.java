package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsSyllabusItemsDto;
import com.ims.academic.entity.ImsSyllabusItems;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsSyllabusItemsRepo;
import com.ims.academic.service.ImsSyllabusItemsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsSyllabusItemsServiceImpl implements ImsSyllabusItemsService {

    private final ImsSyllabusItemsRepo repo;
    private final ModelMapper modelMapper;

    private ImsSyllabusItemsDto toDto(ImsSyllabusItems entity) {
        return modelMapper.map(entity, ImsSyllabusItemsDto.class);
    }

    private ImsSyllabusItems toEntity(ImsSyllabusItemsDto dto) {
        return modelMapper.map(dto, ImsSyllabusItems.class);
    }

    @Override
    public ImsSyllabusItemsDto create(ImsSyllabusItemsDto dto) {
        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsSyllabusItemsDto update(String id, ImsSyllabusItemsDto dto) {

        ImsSyllabusItems existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SyllabusItem ID", id));

        existing.setTitle(dto.getTitle());
        existing.setSummary(dto.getSummary());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsSyllabusItemsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("SyllabusItem ID", id));
    }

    @Override
    public List<ImsSyllabusItemsDto> getByChapterId(String chapterId) {
        return repo.findByChapterId(chapterId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("SyllabusItem ID", id);
        }
        repo.deleteById(id);
    }
}
