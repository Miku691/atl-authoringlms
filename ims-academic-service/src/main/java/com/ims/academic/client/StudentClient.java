package com.ims.academic.client;

import com.ims.academic.dto.MessageDto;
import com.ims.academic.dto.external.ImsStudentEnrollmentsDto;
import com.ims.academic.dto.external.ImsStudentGuardiansDto;
import com.ims.academic.dto.external.ImsStudentsDto;
import com.ims.academic.util.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "ims-student-service")
public interface StudentClient {

    @GetMapping("/students/{id}")
    ApiResponse<ImsStudentsDto> getStudentById(@PathVariable("id") String id);

    @GetMapping("/guardians/student/{studentId}")
    ApiResponse<List<ImsStudentGuardiansDto>> getGuardiansByStudentId(
            @PathVariable("studentId") String studentId);

    @GetMapping("/enrollments/student/{studentId}")
    ApiResponse<List<ImsStudentEnrollmentsDto>> getEnrollmentsByStudentId(
            @PathVariable("studentId") String studentId);
}
