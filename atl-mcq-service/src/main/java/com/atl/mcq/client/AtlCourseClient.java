package com.atl.mcq.client;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "atl-course-client", url = "http://localhost:8082/atl")
public interface AtlCourseClient {

}
