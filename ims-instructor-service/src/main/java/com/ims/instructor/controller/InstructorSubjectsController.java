package com.ims.instructor.controller;

import com.ims.instructor.dto.ImsInstructorSubjectsDto;
import com.ims.instructor.service.ImsInstructorSubjectsService;
import com.ims.instructor.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/instructors/subjects")
@RequiredArgsConstructor
public class InstructorSubjectsController {

    private final ImsInstructorSubjectsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsInstructorSubjectsDto>> assignSubject(
            @RequestBody ImsInstructorSubjectsDto dto) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Subject assigned", service.assign(dto)));
    }

    @GetMapping("/{instructorId}")
    public ResponseEntity<ApiResponse<List<ImsInstructorSubjectsDto>>> getSubjects(@PathVariable String instructorId) {
        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Subjects fetched", service.getByInstructor(instructorId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeSubject(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Subject removed", null));
    }
}
