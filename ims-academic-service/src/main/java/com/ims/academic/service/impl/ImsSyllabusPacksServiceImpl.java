package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsSyllabusPacksDto;
import com.ims.academic.entity.ImsSyllabusPacks;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsSyllabusPacksRepo;
import com.ims.academic.service.ImsSyllabusPacksService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsSyllabusPacksServiceImpl implements ImsSyllabusPacksService {

    private final ImsSyllabusPacksRepo repo;
    private final ModelMapper modelMapper;

    private ImsSyllabusPacksDto toDto(ImsSyllabusPacks entity) {
        return modelMapper.map(entity, ImsSyllabusPacksDto.class);
    }

    private ImsSyllabusPacks toEntity(ImsSyllabusPacksDto dto) {
        return modelMapper.map(dto, ImsSyllabusPacks.class);
    }

    @Override
    public ImsSyllabusPacksDto create(ImsSyllabusPacksDto dto) {
        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsSyllabusPacksDto update(String id, ImsSyllabusPacksDto dto) {

        ImsSyllabusPacks existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SyllabusPack ID", id));

        existing.setTitle(dto.getTitle());
        existing.setBoard(dto.getBoard());
        // TenantId usually doesn't change on update

        return toDto(repo.save(existing));
    }

    @Override
    public ImsSyllabusPacksDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("SyllabusPack ID", id));
    }

    @Override
    public List<ImsSyllabusPacksDto> getByTenantId(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("SyllabusPack ID", id);
        }
        repo.deleteById(id);
    }
}
