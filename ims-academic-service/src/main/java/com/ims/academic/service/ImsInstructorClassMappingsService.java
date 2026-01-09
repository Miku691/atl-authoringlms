package com.ims.academic.service;

import com.ims.academic.dto.ImsInstructorClassMappingsDto;
import java.util.List;

public interface ImsInstructorClassMappingsService {

    ImsInstructorClassMappingsDto create(ImsInstructorClassMappingsDto dto);

    ImsInstructorClassMappingsDto update(String id, ImsInstructorClassMappingsDto dto);

    ImsInstructorClassMappingsDto getById(String id);

    List<ImsInstructorClassMappingsDto> getByInstructorId(String instructorId);

    List<ImsInstructorClassMappingsDto> getByClassId(String classId);

    void delete(String id);
}
