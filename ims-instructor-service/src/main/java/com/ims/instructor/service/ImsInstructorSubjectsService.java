package com.ims.instructor.service;

import com.ims.instructor.dto.ImsInstructorSubjectsDto;
import java.util.List;

public interface ImsInstructorSubjectsService {
    ImsInstructorSubjectsDto assign(ImsInstructorSubjectsDto dto);
    List<ImsInstructorSubjectsDto> getByInstructor(String instructorId);
    ImsInstructorSubjectsDto getById(String id);
    List<ImsInstructorSubjectsDto> getAll();
    void delete(String id);
}
