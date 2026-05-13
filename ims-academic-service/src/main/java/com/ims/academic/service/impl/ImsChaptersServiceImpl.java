package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsChaptersDto;
import com.ims.academic.entity.ImsChapters;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsChaptersRepo;
import com.ims.academic.repo.ImsOfferingSubjectRepo;
import com.ims.academic.service.ImsChaptersService;
import com.ims.academic.entity.ImsOfferingSubject;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsChaptersServiceImpl implements ImsChaptersService {

    private final ImsChaptersRepo repo;
    private final ImsOfferingSubjectRepo offeringSubjectRepo;
    private final ModelMapper modelMapper;

    @Override
    public ImsChaptersDto create(ImsChaptersDto dto) {
        ImsChapters entity = modelMapper.map(dto, ImsChapters.class);

        if (dto.getOfferingSubjectId() != null) {
            ImsOfferingSubject offeringSubject = offeringSubjectRepo.findById(dto.getOfferingSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("OfferingSubject ID", dto.getOfferingSubjectId()));

            if (offeringSubject.getOffering() != null && 
                offeringSubject.getOffering().getClassId() != null) {
                
                entity.setLevelId(offeringSubject.getOffering().getClassId());
                entity.setSubjectId(offeringSubject.getSubject().getId());
                entity.setOfferingSubject(null);
            } else {
                entity.setOfferingSubject(offeringSubject);
            }
        } else {
            entity.setLevelId(dto.getLevelId());
            entity.setSubjectId(dto.getSubjectId());
        }

        return toDto(repo.save(entity));
    }

    @Override
    public ImsChaptersDto update(String id, ImsChaptersDto dto) {
        ImsChapters existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter ID", id));

        existing.setTitle(dto.getTitle());
        existing.setOrderIndex(dto.getOrderIndex());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsChaptersDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter ID", id));
    }

    @Override
    public List<ImsChaptersDto> getByOfferingSubjectId(String offeringSubjectId) {
        List<ImsChapters> chapters = repo.findByOfferingSubjectIdOrderByOrderIndexAsc(offeringSubjectId);
        
        if (chapters.isEmpty()) {
            ImsOfferingSubject os = offeringSubjectRepo.findById(offeringSubjectId).orElse(null);
            if (os != null && os.getOffering() != null && os.getOffering().getClassId() != null) {
                chapters = repo.findByLevelIdAndSubjectIdOrderByOrderIndexAsc(os.getOffering().getClassId(), os.getSubject().getId());
            }
        }

        return chapters.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Chapter ID", id);
        }
        repo.deleteById(id);
    }

    private ImsChaptersDto toDto(ImsChapters entity) {
        ImsChaptersDto dto = modelMapper.map(entity, ImsChaptersDto.class);
        if (entity.getOfferingSubject() != null) {
            dto.setOfferingSubjectId(entity.getOfferingSubject().getId());
        }
        return dto;
    }
}
