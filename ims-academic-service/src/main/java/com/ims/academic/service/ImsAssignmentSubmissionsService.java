package com.ims.academic.service;

import com.ims.academic.dto.ImsAssignmentSubmissionsDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ImsAssignmentSubmissionsService {

    ImsAssignmentSubmissionsDto submitAssignment(String assignmentId, String studentId, MultipartFile file);

    ImsAssignmentSubmissionsDto gradeSubmission(String id, ImsAssignmentSubmissionsDto dto);

    ImsAssignmentSubmissionsDto getById(String id);

    List<ImsAssignmentSubmissionsDto> getByAssignmentId(String assignmentId);

    void delete(String id);
}
