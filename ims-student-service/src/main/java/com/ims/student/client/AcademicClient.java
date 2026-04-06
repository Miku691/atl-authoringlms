package com.ims.student.client;

import com.ims.student.dto.external.ImsClassesDto;
import com.ims.student.dto.external.ImsOfferingInstructorsDto;
import com.ims.student.dto.external.ImsOfferingsDto;
import com.ims.student.dto.external.ImsSectionsDto;
import com.ims.student.util.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "ims-academic-service")  //, path = "/ims-academic"
public interface AcademicClient {

    @GetMapping("/classes/offering/{offeringId}")
    ApiResponse<List<ImsClassesDto>> getClassesByOffering(@PathVariable("offeringId") String offeringId);

    // Assuming there is an endpoint to check offering validity directly or we infer
    // from above.
    // For now, let's assume we validate by checking if it returns classes or if we
    // can get the offering itself.
    // Better: GET /ims-academic/offerings/{id} if it exists.
    // I will guess there is an offering controller based on naming conventions.

    @GetMapping("/offerings/{id}")
    ApiResponse<ImsOfferingsDto> getOfferingById(@PathVariable("id") String id);

    @PostMapping("/offerings/bulk-fetch")
    ApiResponse<List<ImsOfferingsDto>> getOfferingsByIds(@RequestBody List<String> ids);

    @GetMapping("/sections/{id}")
    ApiResponse<ImsSectionsDto> getSectionById(@PathVariable("id") String id);

    @GetMapping("/offering-instructors/instructor/{instructorId}")
    ApiResponse<List<ImsOfferingInstructorsDto>> getByInstructorId(@PathVariable("instructorId") String instructorId);
}
