package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsChaptersDto;
import com.ims.academic.entity.ImsChapters;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsChaptersRepo;
import com.ims.academic.service.ImsChaptersService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsChaptersServiceImpl implements ImsChaptersService {

    private final ImsChaptersRepo repo;
    private final ModelMapper modelMapper;

    private ImsChaptersDto toDto(ImsChapters entity) {
        return modelMapper.map(entity, ImsChaptersDto.class);
    }

    private ImsChapters toEntity(ImsChaptersDto dto) {
        return modelMapper.map(dto, ImsChapters.class);
    }

    @Override
    public ImsChaptersDto create(ImsChaptersDto dto) {
        // Here we could add logic to ensure syllabusPackId exists using
        // ImsSyllabusPacksRepo
        // For now, assuming basic CRUD without cross-service/cross-repo validation
        // unless strictly needed
        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsChaptersDto update(String id, ImsChaptersDto dto) {

        ImsChapters existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter ID", id));

        existing.setTitle(dto.getTitle());
        existing.setOrderIndex(dto.getOrderIndex());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsChaptersDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter ID", id));
    }

    @Override
    public List<ImsChaptersDto> getBySyllabusPackId(String syllabusPackId) {
        return repo.findBySyllabusPackId(syllabusPackId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Chapter ID", id);
        }
        repo.deleteById(id);
    }
}
