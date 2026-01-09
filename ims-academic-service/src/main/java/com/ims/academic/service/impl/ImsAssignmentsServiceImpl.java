package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsAssignmentsDto;
import com.ims.academic.entity.ImsAssignments;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAssignmentsRepo;
import com.ims.academic.service.ImsAssignmentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAssignmentsServiceImpl implements ImsAssignmentsService {

    private final ImsAssignmentsRepo repo;
    private final ModelMapper modelMapper;

    private ImsAssignmentsDto toDto(ImsAssignments entity) {
        return modelMapper.map(entity, ImsAssignmentsDto.class);
    }

    private ImsAssignments toEntity(ImsAssignmentsDto dto) {
        return modelMapper.map(dto, ImsAssignments.class);
    }

    @Override
    @Transactional
    public ImsAssignmentsDto create(ImsAssignmentsDto dto) {
        ImsAssignments entity = toEntity(dto);

        if (entity.getSubmissions() != null) {
            entity.getSubmissions().forEach(sub -> sub.setAssignment(entity));
        }

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsAssignmentsDto update(String id, ImsAssignmentsDto dto) {
        ImsAssignments existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment ID", id));

        existing.setOfferingId(dto.getOfferingId());
        existing.setSubjectId(dto.getSubjectId());
        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setDueDate(dto.getDueDate());
        existing.setCreatedBy(dto.getCreatedBy());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsAssignmentsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment ID", id));
    }

    @Override
    public List<ImsAssignmentsDto> getByOfferingId(String offeringId) {
        return repo.findByOfferingId(offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Assignment ID", id);
        }
        repo.deleteById(id);
    }
}
