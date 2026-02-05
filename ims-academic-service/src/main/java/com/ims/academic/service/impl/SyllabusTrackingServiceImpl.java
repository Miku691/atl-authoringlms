package com.ims.academic.service.impl;

import com.ims.academic.dto.SyllabusCoverageDto;
import com.ims.academic.entity.ImsTopics;
import com.ims.academic.entity.ImsOfferingSubject;
import com.ims.academic.entity.SyllabusCoverage;
import com.ims.academic.enums.CoverageStatus;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsTopicsRepo;
import com.ims.academic.repo.ImsOfferingSubjectRepo;
import com.ims.academic.repo.SyllabusCoverageRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SyllabusTrackingServiceImpl {

    private final SyllabusCoverageRepo coverageRepo;
    private final ImsOfferingSubjectRepo offeringSubjectRepo;
    private final ImsTopicsRepo topicRepo;
    private final ModelMapper modelMapper;

    public SyllabusCoverageDto updateCoverage(SyllabusCoverageDto dto) {
        ImsOfferingSubject offeringSubject = offeringSubjectRepo.findById(dto.getOfferingSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Offering Subject ID", dto.getOfferingSubjectId()));

        ImsTopics topic = topicRepo.findById(dto.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic ID", dto.getTopicId()));

        SyllabusCoverage coverage = coverageRepo
                .findByOfferingSubjectIdAndTopicId(dto.getOfferingSubjectId(), dto.getTopicId())
                .orElse(SyllabusCoverage.builder()
                        .offeringSubject(offeringSubject)
                        .topic(topic)
                        .status(CoverageStatus.PENDING)
                        .build());

        coverage.setStatus(dto.getStatus());
        if (dto.getStatus() == CoverageStatus.COMPLETED) {
            coverage.setCompletedAt(Instant.now());
            coverage.setCompletedBy(dto.getCompletedBy());
        }

        return toDto(coverageRepo.save(coverage));
    }

    public List<SyllabusCoverageDto> getCoverage(String offeringSubjectId) {
        return coverageRepo.findByOfferingSubjectId(offeringSubjectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SyllabusCoverageDto toDto(SyllabusCoverage entity) {
        SyllabusCoverageDto dto = modelMapper.map(entity, SyllabusCoverageDto.class);
        dto.setOfferingSubjectId(entity.getOfferingSubject().getId());
        dto.setTopicId(entity.getTopic().getId());
        dto.setTopicTitle(entity.getTopic().getTitle());
        return dto;
    }
}
