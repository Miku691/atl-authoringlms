package com.ims.academic.service.impl;

import com.ims.academic.dto.MessageDto;
import com.ims.academic.dto.SubjectRequestDto;
import com.ims.academic.dto.SubjectResponseDto;
import com.ims.academic.entity.ImsSubjects;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsSubjectsRepo;
import com.ims.academic.service.ImsSubjectsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImsSubjectsServiceImpl implements ImsSubjectsService {

    private final ImsSubjectsRepo subjectsRepo;
    private final com.ims.academic.repo.ImsProgramsRepo programsRepo;
    private final ModelMapper modelMapper;

    @Override
    public MessageDto createSubject(String tenantId, SubjectRequestDto dto) {
        // Enforce uniqueness within Tenant
        if (subjectsRepo.existsByTenantIdAndCode(tenantId, dto.getCode())) {
            throw new RuntimeException("Subject with this Code already exists in your institute.");
        }
        if (subjectsRepo.existsByTenantIdAndTitle(tenantId, dto.getTitle())) {
            throw new RuntimeException("Subject with this Title already exists in your institute.");
        }

        // Manual mapping to avoid ModelMapper ambiguity with setId()
        ImsSubjects subject = new ImsSubjects();
        subject.setCode(dto.getCode());
        subject.setTitle(dto.getTitle());
        subject.setSubjectType(dto.getSubjectType());
        subject.setTenantId(tenantId);
        subject.setTotalExamMarks(dto.getTotalExamMarks());

        if (dto.getProgramId() != null && !dto.getProgramId().isEmpty()) {
            com.ims.academic.entity.ImsPrograms program = programsRepo.findById(dto.getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program", dto.getProgramId()));
            subject.setProgram(program);
        }

        subjectsRepo.save(subject);
        return new MessageDto("Subject created successfully", "SUCCESS");
    }

    @Override
    public List<SubjectResponseDto> getAllSubjects(String tenantId) {
        List<ImsSubjects> subjects = subjectsRepo.findByTenantId(tenantId);
        return subjects.stream()
                .map(s -> modelMapper.map(s, SubjectResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto deleteSubject(String tenantId, String subjectId) {
        ImsSubjects subject = subjectsRepo.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));

        if (!subject.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access Denied: Subject does not belong to your institute.");
        }

        subjectsRepo.delete(subject);
        return new MessageDto("Subject deleted successfully", "SUCCESS");
    }
}
