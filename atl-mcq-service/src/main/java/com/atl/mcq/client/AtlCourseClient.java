package com.atl.mcq.client;

import com.atl.mcq.dto.AtlSaveQuestionIdDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "atl-course-client", url = "http://localhost:8082/atl")
public interface AtlCourseClient {

    @PostMapping("/mcq")
    void saveQuestionIdToSlide(AtlSaveQuestionIdDto questionIdDto);
}
