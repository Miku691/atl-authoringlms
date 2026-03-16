package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsOfferingsDto;
import com.ims.academic.dto.ImsSectionsDto;
import com.ims.academic.entity.AcademicSession;
import com.ims.academic.entity.ImsClasses;
import com.ims.academic.entity.ImsOfferings;
import com.ims.academic.entity.ImsSections;
import com.ims.academic.enums.OfferingType;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.AcademicSessionRepo;
import com.ims.academic.repo.ImsClassesRepo;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsSectionsRepo;
import com.ims.academic.service.ImsOfferingsService;
import com.ims.academic.service.ImsSectionsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsSectionsServiceImpl implements ImsSectionsService {

    private final ImsSectionsRepo repo;
    private final ImsClassesRepo classesRepo;
    private final AcademicSessionRepo sessionRepo;
    private final ImsOfferingsService offeringsService;
    private final ImsOfferingsRepo offeringsRepo;
    private final ModelMapper modelMapper;

    private ImsSectionsDto toDto(ImsSections entity) {
        ImsSectionsDto dto = modelMapper.map(entity, ImsSectionsDto.class);
        dto.setClassId(entity.getImsClass().getId());
        if (entity.getOffering() != null) {
            dto.setOfferingId(entity.getOffering().getId());
            dto.setOfferingName(entity.getOffering().getName());
        }
        return dto;
    }

    @Override
    public ImsSectionsDto create(ImsSectionsDto dto) {

        ImsClasses imsClass = classesRepo.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class ID", dto.getClassId()));

        if (repo.existsByImsClassIdAndName(dto.getClassId(), dto.getName())) {
            throw new ResourceAlreadyExistException(
                    dto.getName(), "SECTION", "Name");
        }

        // Automatic Orchestration: Create Offering for this section
        if (dto.getOfferingId() == null && dto.getProgramId() != null) {
            AcademicSession currentSession = sessionRepo.findFirstByTenantIdAndIsCurrentTrue(dto.getTenantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Active Academic Session", dto.getTenantId()));

            String offeringName = imsClass.getName() + " - " + dto.getName();
            ImsOfferingsDto sectionOffering = ImsOfferingsDto.builder()
                    .tenantId(dto.getTenantId())
                    .programId(dto.getProgramId())
                    .sessionId(currentSession.getId())
                    .type(OfferingType.SCHOOL_CLASS)
                    .name(offeringName)
                    .startDate(LocalDate.now())
                    .endDate(currentSession.getEndDate())
                    .capacity(dto.getCapacity() != null ? dto.getCapacity() : 40)
                    .build();
            ImsOfferingsDto savedOffering = offeringsService.create(sectionOffering);
            dto.setOfferingId(savedOffering.getId());
        }

        ImsSections section = ImsSections.builder()
                .tenantId(dto.getTenantId())
                .imsClass(imsClass)
                .name(dto.getName())
                .build();

        if (dto.getOfferingId() != null) {
            ImsOfferings offering = offeringsRepo.findById(dto.getOfferingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Offering", dto.getOfferingId()));
            section.setOffering(offering);
        }

        return toDto(repo.save(section));
    }

    @Override
    public ImsSectionsDto update(String id, ImsSectionsDto dto) {

        ImsSections existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section ID", id));

        if (dto.getName() != null)
            existing.setName(dto.getName());

        if (dto.getOfferingId() != null) {
            ImsOfferings offering = offeringsRepo.findById(dto.getOfferingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Offering", dto.getOfferingId()));
            existing.setOffering(offering);
        }

        return toDto(repo.save(existing));
    }

    @Override
    public ImsSectionsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Section ID", id));
    }

    @Override
    public List<ImsSectionsDto> getByClass(String classId) {
        return repo.findByImsClassId(classId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsSectionsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Section ID", id);
        }
        repo.deleteById(id);
    }
}