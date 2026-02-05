package com.ims.academic.service.impl;

import com.ims.academic.dto.ClassScheduleDto;
import com.ims.academic.entity.ClassSchedule;
import com.ims.academic.entity.ImsOfferings;
import com.ims.academic.entity.ImsSubjects;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ClassScheduleRepo;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsSubjectsRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassScheduleServiceImpl {

    private final ClassScheduleRepo repo;
    private final ImsOfferingsRepo offeringRepo;
    private final ImsSubjectsRepo subjectRepo;
    private final ModelMapper modelMapper;

    public ClassScheduleDto create(ClassScheduleDto dto) {
        ImsOfferings offering = offeringRepo.findById(dto.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", dto.getOfferingId()));

        ImsSubjects subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject ID", dto.getSubjectId()));

        // Conflict detection logic would go here (e.g., room occupied, instructor busy)

        ClassSchedule entity = modelMapper.map(dto, ClassSchedule.class);
        entity.setOffering(offering);
        entity.setSubject(subject);
        entity.setTenantId(offering.getTenantId());

        return toDto(repo.save(entity));
    }

    public List<ClassScheduleDto> getByOffering(String offeringId) {
        return repo.findByOfferingId(offeringId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void delete(String id) {
        repo.deleteById(id);
    }

    private ClassScheduleDto toDto(ClassSchedule entity) {
        ClassScheduleDto dto = modelMapper.map(entity, ClassScheduleDto.class);
        dto.setOfferingId(entity.getOffering().getId());
        dto.setSubjectId(entity.getSubject().getId());
        dto.setSubjectName(entity.getSubject().getName());
        return dto;
    }
}
