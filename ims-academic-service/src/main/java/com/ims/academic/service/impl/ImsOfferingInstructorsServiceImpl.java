package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsOfferingInstructorsDto;
import com.ims.academic.entity.ImsOfferingInstructors;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingInstructorsRepo;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsSubjectsRepo;
import com.ims.academic.service.ImsOfferingInstructorsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsOfferingInstructorsServiceImpl implements ImsOfferingInstructorsService {

    private final ImsOfferingInstructorsRepo repo;
    private final ModelMapper modelMapper;
    private final ImsOfferingsRepo offeringsRepo;
    private final ImsSubjectsRepo subjectsRepo;

    private ImsOfferingInstructorsDto toDto(ImsOfferingInstructors entity) {
        ImsOfferingInstructorsDto dto = modelMapper.map(entity, ImsOfferingInstructorsDto.class);

        offeringsRepo.findById(entity.getOfferingId()).ifPresent(o -> dto.setOfferingName(o.getName()));

        if (entity.getSubjectId() != null) {
            subjectsRepo.findById(entity.getSubjectId()).ifPresent(s -> dto.setSubjectName(s.getTitle()));
        } else {
            dto.setSubjectName("All Subjects");
        }

        return dto;
    }

    private ImsOfferingInstructors toEntity(ImsOfferingInstructorsDto dto) {
        return modelMapper.map(dto, ImsOfferingInstructors.class);
    }

    @Override
    public ImsOfferingInstructorsDto create(ImsOfferingInstructorsDto dto) {

        if (repo.existsByOfferingIdAndInstructorIdAndSubjectId(dto.getOfferingId(), dto.getInstructorId(),
                dto.getSubjectId())) {
            throw new ResourceAlreadyExistException(
                    "Instructor already assigned to Offering/Subject", "OFFERING_INSTRUCTOR",
                    "OfferingId_InstructorId_SubjectId");
        }

        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsOfferingInstructorsDto update(String id, ImsOfferingInstructorsDto dto) {

        ImsOfferingInstructors existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OfferingInstructor ID", id));

        existing.setRole(dto.getRole());
        // Identity fields (offering, instructor, subject) are usually not updated
        // directly,
        // to avoid consistency issues.

        return toDto(repo.save(existing));
    }

    @Override
    public ImsOfferingInstructorsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("OfferingInstructor ID", id));
    }

    @Override
    public List<ImsOfferingInstructorsDto> getByOfferingId(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsOfferingInstructorsDto> getByInstructorId(String instructorId) {
        return repo.findByInstructorId(instructorId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("OfferingInstructor ID", id);
        }
        repo.deleteById(id);
    }
}
