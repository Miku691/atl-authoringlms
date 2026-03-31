package com.ims.academic.service.impl;

import com.ims.academic.dto.AcademicSessionDto;
import com.ims.academic.entity.AcademicSession;
import com.ims.academic.entity.ImsPrograms;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.AcademicSessionRepo;
import com.ims.academic.repo.ImsProgramsRepo;
import com.ims.academic.service.AcademicSessionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicSessionServiceImpl implements AcademicSessionService {

    private final AcademicSessionRepo repo;
    private final ImsProgramsRepo programRepo;
    private final ModelMapper modelMapper;

    @Override
    public AcademicSessionDto create(AcademicSessionDto dto) {
        ImsPrograms program = programRepo.findById(dto.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program ID", dto.getProgramId()));

        AcademicSession entity = modelMapper.map(dto, AcademicSession.class);
        entity.setProgram(program);
        
        // Ensure initial status is DRAFT if not specified
        if (entity.getStatus() == null) {
            entity.setStatus(AcademicSession.SessionStatus.DRAFT);
        }

        return toDto(repo.save(entity));
    }

    @Override
    public AcademicSessionDto update(String id, AcademicSessionDto dto) {
        AcademicSession existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session ID", id));

        if (existing.isLocked()) {
            throw new IllegalStateException("Cannot update a locked session.");
        }

        if (dto.getName() != null)
            existing.setName(dto.getName());
        if (dto.getStartDate() != null)
            existing.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            existing.setEndDate(dto.getEndDate());
        
        existing.setCurrent(dto.isCurrent());
        existing.setLocked(dto.isLocked());
        
        if (dto.getStatus() != null) {
            existing.setStatus(AcademicSession.SessionStatus.valueOf(dto.getStatus()));
        }

        return toDto(repo.save(existing));
    }

    @Override
    public AcademicSessionDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Session ID", id));
    }

    @Override
    public List<AcademicSessionDto> getByProgram(String programId) {
        return repo.findByProgramId(programId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AcademicSessionDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        AcademicSession existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session ID", id));
        
        if (existing.isLocked()) {
            throw new IllegalStateException("Cannot delete a locked session.");
        }
        
        repo.deleteById(id);
    }

    private AcademicSessionDto toDto(AcademicSession entity) {
        AcademicSessionDto dto = modelMapper.map(entity, AcademicSessionDto.class);
        dto.setProgramId(entity.getProgram().getId());
        dto.setStatus(entity.getStatus().name());
        return dto;
    }
}
