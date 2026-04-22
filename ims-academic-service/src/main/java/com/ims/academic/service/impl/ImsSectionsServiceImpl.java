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
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImsSectionsServiceImpl implements ImsSectionsService {

    private final ImsSectionsRepo repo;
    private final ImsClassesRepo classesRepo;
    private final AcademicSessionRepo sessionRepo;
    private final ImsOfferingsService offeringsService;
    private final ImsOfferingsRepo offeringsRepo;
    private final com.ims.academic.repo.ImsProgramsRepo programsRepo;
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

        // Check for duplicate section in the same offering
        ImsSections existingSection = repo.findByImsClassIdAndNameAndOfferingId(dto.getClassId(), dto.getName(), dto.getOfferingId())
                .orElse(null);
        
        if (existingSection != null) {
            log.info("Section {} already exists for offering {}, returning existing.", dto.getName(), dto.getOfferingId());
            return toDto(existingSection);
        }

        // Determine OfferingType based on ProgramLevel
        OfferingType type = OfferingType.SCHOOL_CLASS;
        if (dto.getProgramId() != null) {
            com.ims.academic.entity.ImsPrograms program = programsRepo.findById(dto.getProgramId()).orElse(null);
            if (program != null) {
                com.ims.academic.enums.ProgramLevel level = program.getLevel();
                if (level == com.ims.academic.enums.ProgramLevel.UNDERGRAD
                        || level == com.ims.academic.enums.ProgramLevel.POSTGRAD) {
                    type = OfferingType.COLLEGE_PROGRAM;
                } else if (level == com.ims.academic.enums.ProgramLevel.COACHING) {
                    type = OfferingType.COACHING_BATCH;
                } else if (level == com.ims.academic.enums.ProgramLevel.SCHOOL) {
                    type = OfferingType.SCHOOL_CLASS;
                }
            }
        }

        // Automatic Orchestration: Create Offering only if missing and programId is provided.
        // This is strictly for SCHOOL model where Class + Section = Offering
        if (dto.getOfferingId() == null && dto.getProgramId() != null) {
            
            if (type != OfferingType.SCHOOL_CLASS) {
                throw new IllegalArgumentException("Offering ID (Semester/Batch) is mandatory when adding sections for College/Coaching institutions.");
            }

            AcademicSession currentSession = sessionRepo.findFirstByTenantIdAndIsCurrentTrue(dto.getTenantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Active Academic Session", dto.getTenantId()));

            String offeringName = dto.getOfferingName();
            if (offeringName == null) {
                // Default for SCHOOL_CLASS
                offeringName = imsClass.getName() + " - " + dto.getName();
            }

            ImsOfferingsDto sectionOffering = ImsOfferingsDto.builder()
                    .tenantId(dto.getTenantId())
                    .programId(dto.getProgramId())
                    .sessionId(currentSession.getId())
                    .classId(imsClass.getId()) // Optional backward link
                    .type(type)
                    .name(offeringName)
                    .startDate(LocalDate.now())
                    .endDate(currentSession.getEndDate())
                    .capacity(dto.getCapacity() != null ? dto.getCapacity() : 40)
                    .build();
            ImsOfferingsDto savedOffering = offeringsService.create(sectionOffering);
            dto.setOfferingId(savedOffering.getId());
        }

        log.info("Creating Section: name={}, class={}, offering={}, type={}", 
            dto.getName(), dto.getClassId(), dto.getOfferingId(), type);

        // Final Validation: Every section MUST be linked to an offering
        if (dto.getOfferingId() == null) {
            String errorMsg = (type == OfferingType.SCHOOL_CLASS)
                    ? "Offering ID is required (Or Program ID for auto-creation)"
                    : "Offering ID (Semester/Batch) is mandatory for College/Coaching institutions";
            throw new IllegalArgumentException(errorMsg);
        }

        ImsOfferings offering = offeringsRepo.findById(dto.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Offering", dto.getOfferingId()));

        ImsSections section = ImsSections.builder()
                .tenantId(dto.getTenantId())
                .imsClass(imsClass)
                .name(dto.getName())
                .offering(offering)
                .build();

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