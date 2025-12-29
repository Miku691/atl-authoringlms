package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsOfferingsDto;
import com.ims.academic.entity.ImsOfferings;
import com.ims.academic.entity.ImsPrograms;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsProgramsRepo;
import com.ims.academic.service.ImsOfferingsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsOfferingsServiceImpl implements ImsOfferingsService {

    private final ImsOfferingsRepo repo;
    private final ImsProgramsRepo programsRepo;
    private final ModelMapper modelMapper;

    private ImsOfferingsDto toDto(ImsOfferings entity) {
        ImsOfferingsDto dto = modelMapper.map(entity, ImsOfferingsDto.class);
        dto.setProgramId(entity.getProgram().getId());
        return dto;
    }

    @Override
    public ImsOfferingsDto create(ImsOfferingsDto dto) {

        ImsPrograms program = programsRepo.findById(dto.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("Program ID", dto.getProgramId()));

        ImsOfferings offering = modelMapper.map(dto, ImsOfferings.class);
        offering.setProgram(program);

        return toDto(repo.save(offering));
    }

    @Override
    public ImsOfferingsDto update(String id, ImsOfferingsDto dto) {

        ImsOfferings existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", id));

        existing.setName(dto.getName());
        existing.setType(dto.getType());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setCapacity(dto.getCapacity());
        existing.setMetadata(dto.getMetadata());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsOfferingsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", id));
    }

    @Override
    public List<ImsOfferingsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsOfferingsDto> getByProgram(String programId) {
        return repo.findByProgramId(programId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Offering ID", id);
        }
        repo.deleteById(id);
    }
}