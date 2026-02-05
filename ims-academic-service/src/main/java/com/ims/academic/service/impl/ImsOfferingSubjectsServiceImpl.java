package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsOfferingSubjectsDto;
import com.ims.academic.entity.ImsOfferingSubject;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingSubjectRepo;
import com.ims.academic.service.ImsOfferingSubjectsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsOfferingSubjectsServiceImpl implements ImsOfferingSubjectsService {

    private final ImsOfferingSubjectRepo repo;
    private final ModelMapper modelMapper;

    private ImsOfferingSubjectsDto toDto(ImsOfferingSubject entity) {
        return modelMapper.map(entity, ImsOfferingSubjectsDto.class);
    }

    private ImsOfferingSubject toEntity(ImsOfferingSubjectsDto dto) {
        return modelMapper.map(dto, ImsOfferingSubject.class);
    }

    @Override
    public ImsOfferingSubjectsDto create(ImsOfferingSubjectsDto dto) {

        if (repo.existsByOfferingIdAndSubjectId(dto.getOfferingId(), dto.getSubjectId())) {
            throw new ResourceAlreadyExistException(
                    "Subject already assigned to Offering", "OFFERING_SUBJECT", "OfferingId_SubjectId");
        }

        return toDto(repo.save(toEntity(dto)));
    }

    @Override
    public ImsOfferingSubjectsDto update(String id, ImsOfferingSubjectsDto dto) {

        ImsOfferingSubject existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OfferingSubject ID", id));

        existing.setOptional(dto.isOptional());
        if (dto.getCredits() != null) {
            existing.setCredits(dto.getCredits().doubleValue());
        }
        // Typically we don't update offeringId or subjectId in an update call unless
        // specifically requested,
        // as that changes the identity of the relationship. focusing on mutable fields.

        return toDto(repo.save(existing));
    }

    @Override
    public ImsOfferingSubjectsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("OfferingSubject ID", id));
    }

    @Override
    public List<ImsOfferingSubjectsDto> getByOfferingId(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("OfferingSubject ID", id);
        }
        repo.deleteById(id);
    }
}
