package com.ims.academic.client;

import com.ims.academic.dto.external.ImsInstructorSubjectsDto;
import com.ims.academic.util.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "ims-instructor-service")
public interface InstructorClient {

    @GetMapping("/instructor-subjects/instructor/{instructorId}")
    ApiResponse<List<ImsInstructorSubjectsDto>> getSubjectsByInstructor(
            @PathVariable("instructorId") String instructorId);

}
