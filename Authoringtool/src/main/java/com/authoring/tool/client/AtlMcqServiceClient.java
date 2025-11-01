package com.authoring.tool.client;

import com.authoring.tool.dto.mcq.AtlMcqServiceQuestionDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "atl-mcq-service", url = "http://localhost:8083/mcq")
public interface AtlMcqServiceClient {

    @GetMapping("/questions/slide")
    AtlMcqServiceQuestionDto getQuestionBySlideId(@RequestParam Long slideId);
}
