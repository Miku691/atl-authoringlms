package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsSubjectsDto;
import com.ims.academic.entity.ImsSubjects;
import com.ims.academic.exception.ResourceAlreadyExistException;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsSubjectsRepo;
import com.ims.academic.service.ImsSubjectsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsSubjectsServiceImpl implements ImsSubjectsService {

    private final ImsSubjectsRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public ImsSubjectsDto create(ImsSubjectsDto dto) {

        if (repo.existsByCode(dto.getCode())) {
            throw new ResourceAlreadyExistException(dto.getCode(), "SUBJECT", "Code");
        }

        if (repo.existsByTitle(dto.getTitle())) {
            throw new ResourceAlreadyExistException(dto.getTitle(), "SUBJECT", "Title");
        }

        ImsSubjects entity = modelMapper.map(dto, ImsSubjects.class);
        ImsSubjects saved = repo.save(entity);

        return modelMapper.map(saved, ImsSubjectsDto.class);
    }

    @Override
    public ImsSubjectsDto getById(String id) {
        ImsSubjects subject = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject id", id));

        return modelMapper.map(subject, ImsSubjectsDto.class);
    }

    @Override
    public List<ImsSubjectsDto> getAll() {
        return repo.findAll()
                .stream()
                .map(s -> modelMapper.map(s, ImsSubjectsDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ImsSubjectsDto update(String id, ImsSubjectsDto dto) {

        ImsSubjects existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject id", id));

        if (dto.getCode() != null &&
                !dto.getCode().equals(existing.getCode()) &&
                repo.existsByCode(dto.getCode())) {
            throw new ResourceAlreadyExistException(dto.getCode(), "SUBJECT", "Code");
        }

        if (dto.getTitle() != null &&
                !dto.getTitle().equals(existing.getTitle()) &&
                repo.existsByTitle(dto.getTitle())) {
            throw new ResourceAlreadyExistException(dto.getTitle(), "SUBJECT", "Title");
        }

        modelMapper.map(dto, existing);
        ImsSubjects updated = repo.save(existing);

        return modelMapper.map(updated, ImsSubjectsDto.class);
    }

    @Override
    public void delete(String id) {
        ImsSubjects subject = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject id", id));

        repo.delete(subject);
    }
}
