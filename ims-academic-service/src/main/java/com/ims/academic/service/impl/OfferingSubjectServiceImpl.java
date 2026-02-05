package com.ims.academic.service.impl;

import com.ims.academic.dto.OfferingSubjectDto;
import com.ims.academic.entity.ImsOfferings;
import com.ims.academic.entity.ImsSubjects;
import com.ims.academic.entity.ImsOfferingSubject;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingSubjectRepo;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsSubjectsRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferingSubjectServiceImpl {

    private final ImsOfferingSubjectRepo repo;
    private final ImsOfferingsRepo offeringRepo;
    private final ImsSubjectsRepo subjectRepo;
    private final ModelMapper modelMapper;

    public OfferingSubjectDto addSubjectToOffering(OfferingSubjectDto dto) {
        ImsOfferings offering = offeringRepo.findById(dto.getOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", dto.getOfferingId()));

        ImsSubjects subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject ID", dto.getSubjectId()));

        ImsOfferingSubject entity = modelMapper.map(dto, ImsOfferingSubject.class);
        entity.setOffering(offering);
        entity.setSubject(subject);

        return toDto(repo.save(entity));
    }

    public List<OfferingSubjectDto> getByOffering(String offeringId) {
        return repo.findByOfferingId(offeringId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void removeSubjectFromOffering(String id) {
        repo.deleteById(id);
    }

    private OfferingSubjectDto toDto(ImsOfferingSubject entity) {
        OfferingSubjectDto dto = modelMapper.map(entity, OfferingSubjectDto.class);
        dto.setOfferingId(entity.getOffering().getId());
        dto.setSubjectId(entity.getSubject().getId());
        dto.setSubjectName(entity.getSubject().getName());
        return dto;
    }
}
