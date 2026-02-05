package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsProgramsDto;
import com.ims.academic.entity.ImsPrograms;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsProgramsRepo;
import com.ims.academic.service.ImsProgramsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsProgramsServiceImpl implements ImsProgramsService {

    private final ImsProgramsRepo repo;
    private final ModelMapper modelMapper;

    private ImsProgramsDto toDto(ImsPrograms p) {
        return modelMapper.map(p, ImsProgramsDto.class);
    }

    private ImsPrograms toEntity(ImsProgramsDto dto) {
        return modelMapper.map(dto, ImsPrograms.class);
    }

    @Override
    public ImsProgramsDto create(ImsProgramsDto dto) {

        if (repo.existsByTenantIdAndCode(dto.getTenantId(), dto.getCode())) {
            throw new ResourceAlreadyExistException(
                    dto.getCode(), "PROGRAM", "Code");
        }

        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsProgramsDto update(String id, ImsProgramsDto dto) {

        ImsPrograms existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program ID", id));

        if (dto.getTitle() != null)
            existing.setTitle(dto.getTitle());
        if (dto.getLevel() != null)
            existing.setLevel(dto.getLevel());
        if (dto.getBoard() != null)
            existing.setBoard(dto.getBoard());
        if (dto.getDescription() != null)
            existing.setDescription(dto.getDescription());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsProgramsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Program ID", id));
    }

    @Override
    public List<ImsProgramsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsProgramsDto> getAll() {
        return repo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Program ID", id);
        }
        repo.deleteById(id);
    }

    @Override
    public long countByTenant(String tenantId) {
        return repo.countByTenantId(tenantId);
    }
}
