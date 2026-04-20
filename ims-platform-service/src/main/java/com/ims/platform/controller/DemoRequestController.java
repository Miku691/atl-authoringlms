package com.ims.platform.controller;

import com.ims.platform.dto.DemoRequestDto;
import com.ims.platform.enums.DemoRequestStatus;
import com.ims.platform.service.DemoRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/platform")
@RequiredArgsConstructor
public class DemoRequestController {

    private final DemoRequestService service;

    /**
     * Public endpoint to submit a demo request.
     */
    @PostMapping("/public/demo-requests")
    public ResponseEntity<DemoRequestDto> submitRequest(@Valid @RequestBody DemoRequestDto requestDto) {
        return ResponseEntity.ok(service.submitRequest(requestDto));
    }

    /**
     * Admin endpoint to fetch all requests.
     */
    @GetMapping("/admin/demo-requests")
    public ResponseEntity<List<DemoRequestDto>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    /**
     * Admin endpoint to confirm a meeting with a link.
     */
    @PatchMapping("/admin/demo-requests/{id}/confirm")
    public ResponseEntity<DemoRequestDto> confirmMeeting(
            @PathVariable String id, 
            @RequestBody Map<String, String> payload) {
        String link = payload.get("meetingLink");
        return ResponseEntity.ok(service.confirmMeeting(id, link));
    }

    /**
     * Admin endpoint to update status and add feedback.
     */
    @PatchMapping("/admin/demo-requests/{id}/status")
    public ResponseEntity<DemoRequestDto> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        DemoRequestStatus status = DemoRequestStatus.valueOf((String) payload.get("status"));
        String feedback = (String) payload.get("feedback");
        return ResponseEntity.ok(service.updateStatus(id, status, feedback));
    }
}
