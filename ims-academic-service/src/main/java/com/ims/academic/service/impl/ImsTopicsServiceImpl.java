package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsTopicsDto;
import com.ims.academic.entity.ImsChapters;
import com.ims.academic.entity.ImsTopics;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsChaptersRepo;
import com.ims.academic.repo.ImsTopicsRepo;
import com.ims.academic.service.ImsTopicsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsTopicsServiceImpl implements ImsTopicsService {

    private final ImsTopicsRepo repo;
    private final ImsChaptersRepo chaptersRepo;
    private final ModelMapper modelMapper;

    @Override
    public ImsTopicsDto create(ImsTopicsDto dto) {
        ImsChapters chapter = chaptersRepo.findById(dto.getChapterId())
                .orElseThrow(() -> new ResourceNotFoundException("Chapter ID", dto.getChapterId()));

        ImsTopics entity = modelMapper.map(dto, ImsTopics.class);
        entity.setChapter(chapter);

        return toDto(repo.save(entity));
    }

    @Override
    public ImsTopicsDto update(String id, ImsTopicsDto dto) {
        ImsTopics existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic ID", id));

        existing.setTitle(dto.getTitle());
        existing.setSummary(dto.getSummary());
        // existing.setOrderIndex(dto.getOrderIndex()); // Assuming we might update this
        // too

        return toDto(repo.save(existing));
    }

    @Override
    public ImsTopicsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Topic ID", id));
    }

    @Override
    public List<ImsTopicsDto> getByChapterId(String chapterId) {
        return repo.findByChapterIdOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Topic ID", id);
        }
        repo.deleteById(id);
    }

    private ImsTopicsDto toDto(ImsTopics entity) {
        ImsTopicsDto dto = modelMapper.map(entity, ImsTopicsDto.class);
        dto.setChapterId(entity.getChapter().getId());
        return dto;
    }
}
