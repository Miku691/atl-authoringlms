package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsClassesDto;
import com.ims.academic.entity.ImsClasses;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsClassesRepo;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.service.ImsClassesService;
import com.ims.academic.entity.ImsOfferings;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsClassesServiceImpl implements ImsClassesService {

    private final ImsClassesRepo repo;
    private final ImsOfferingsRepo offeringsRepo;
    private final ModelMapper modelMapper;

    private ImsClassesDto toDto(ImsClasses entity) {
        ImsClassesDto dto = modelMapper.map(entity, ImsClassesDto.class);
        if (entity.getOffering() != null) {
            dto.setOfferingId(entity.getOffering().getId());
            dto.setOfferingName(entity.getOffering().getName());
        }
        return dto;
    }

    private ImsClasses toEntity(ImsClassesDto dto) {
        return modelMapper.map(dto, ImsClasses.class);
    }

    @Override
    public ImsClassesDto create(ImsClassesDto dto) {

        if (repo.existsByTenantIdAndName(dto.getTenantId(), dto.getName())) {
            throw new ResourceAlreadyExistException(
                    dto.getName(), "CLASS", "Name");
        }

        ImsClasses entity = toEntity(dto);

        // Link Offering
        if (dto.getOfferingId() != null) {
            ImsOfferings offering = offeringsRepo.findById(dto.getOfferingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Offering", dto.getOfferingId()));
            entity.setOffering(offering);
        }

        return toDto(repo.save(entity));
    }

    @Override
    public ImsClassesDto update(String id, ImsClassesDto dto) {

        ImsClasses existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", id));

        existing.setName(dto.getName());
        existing.setCode(dto.getCode());

        if (dto.getOfferingId() != null) {
            ImsOfferings offering = offeringsRepo.findById(dto.getOfferingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Offering", dto.getOfferingId()));
            existing.setOffering(offering);
        }

        return toDto(repo.save(existing));
    }

    @Override
    public ImsClassesDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", id));
    }

    @Override
    public List<ImsClassesDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsClassesDto> getByOffering(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Class ID", id);
        }
        repo.deleteById(id);
    }
}
