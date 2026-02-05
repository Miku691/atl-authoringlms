package com.ims.student.service;

import com.ims.student.dto.ImsStudentGuardianMappingDto;
import java.util.List;

public interface ImsStudentGuardianMappingService {
    ImsStudentGuardianMappingDto map(ImsStudentGuardianMappingDto dto);

    List<ImsStudentGuardianMappingDto> getByStudentId(String studentId);

    List<ImsStudentGuardianMappingDto> getByGuardianId(String guardianId);

    void unmap(String mappingId);
}
