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
@RequestMapping("instructor-subjects")
@RequiredArgsConstructor
public class ImsInstructorSubjectsController {

    private final ImsInstructorSubjectsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsInstructorSubjectsDto>> assign(@RequestBody ImsInstructorSubjectsDto dto) {
        ImsInstructorSubjectsDto saved = service.assign(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsInstructorSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Subject assigned to instructor")
                        .apiData(saved)
                        .build()
        );
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<List<ImsInstructorSubjectsDto>>> getByInstructor(@PathVariable String instructorId) {
        List<ImsInstructorSubjectsDto> list = service.getByInstructor(instructorId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImsInstructorSubjectsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Subjects fetched for instructor")
                        .apiData(list)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsInstructorSubjectsDto>> getById(@PathVariable String id) {
        ImsInstructorSubjectsDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsInstructorSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Instructor subject fetched")
                        .apiData(dto)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsInstructorSubjectsDto>>> getAll() {
        List<ImsInstructorSubjectsDto> list = service.getAll();
        return ResponseEntity.ok(
                ApiResponse.<List<ImsInstructorSubjectsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("All instructor-subject mappings fetched")
                        .apiData(list)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mapping deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
