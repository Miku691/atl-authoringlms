package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsAssignmentSubmissionsDto;
import com.ims.academic.entity.ImsAssignmentSubmissions;
import com.ims.academic.entity.ImsAssignments;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAssignmentSubmissionsRepo;
import com.ims.academic.repo.ImsAssignmentsRepo;
import com.ims.academic.service.ImsAssignmentSubmissionsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAssignmentSubmissionsServiceImpl implements ImsAssignmentSubmissionsService {

    private final ImsAssignmentSubmissionsRepo repo;
    private final ImsAssignmentsRepo assignmentRepo;
    private final ModelMapper modelMapper;

    private static final String UPLOAD_DIR = "D:/MIku/Doc/uploads/assignment-submissions/";

    private ImsAssignmentSubmissionsDto toDto(ImsAssignmentSubmissions entity) {
        ImsAssignmentSubmissionsDto dto = modelMapper.map(entity, ImsAssignmentSubmissionsDto.class);
        if (entity.getAssignment() != null) {
            dto.setAssignmentId(entity.getAssignment().getId());
        }
        return dto;
    }

    @Override
    @Transactional
    public ImsAssignmentSubmissionsDto submitAssignment(String assignmentId, String studentId, MultipartFile file) {
        ImsAssignments assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment ID", assignmentId));

        // File upload logic
        String filePath = null;
        if (file != null && !file.isEmpty()) {
            File folder = new File(UPLOAD_DIR + studentId);
            if (!folder.exists())
                folder.mkdirs();

            filePath = UPLOAD_DIR + studentId + "/" + file.getOriginalFilename();
            try {
                file.transferTo(new File(filePath));
            } catch (IOException e) {
                throw new RuntimeException("File upload error: " + e.getMessage());
            }
        }

        ImsAssignmentSubmissions submission = ImsAssignmentSubmissions.builder()
                .assignment(assignment)
                .studentId(studentId)
                .fileUrl(filePath)
                .submittedAt(LocalDateTime.now())
                .build();

        return toDto(repo.save(submission));
    }

    @Override
    @Transactional
    public ImsAssignmentSubmissionsDto gradeSubmission(String id, ImsAssignmentSubmissionsDto dto) {
        ImsAssignmentSubmissions existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission ID", id));

        existing.setScore(dto.getScore());
        existing.setFeedback(dto.getFeedback());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsAssignmentSubmissionsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Submission ID", id));
    }

    @Override
    public List<ImsAssignmentSubmissionsDto> getByAssignmentId(String assignmentId) {
        return repo.findByAssignmentId(assignmentId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        ImsAssignmentSubmissions submission = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission ID", id));

        // Delete local file
        if (submission.getFileUrl() != null) {
            File f = new File(submission.getFileUrl());
            if (f.exists())
                f.delete();
        }

        repo.delete(submission);
    }
}
