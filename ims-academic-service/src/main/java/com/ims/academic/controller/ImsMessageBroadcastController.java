package com.ims.academic.controller;

import com.ims.academic.dto.BroadcastRequestDto;
import com.ims.academic.dto.InAppNotificationDto;
import com.ims.academic.dto.MessageBroadcastDto;
import com.ims.academic.service.ImsMessageBroadcastService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing message broadcasts and in-app notifications.
 */
@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class ImsMessageBroadcastController {

    private final ImsMessageBroadcastService service;

    /**
     * Dispatches a new message broadcast across selected channels.
     *
     * @param request broadcast request payload
     * @return broadcast summary record
     */
    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<MessageBroadcastDto>> sendBroadcast(@RequestBody BroadcastRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<MessageBroadcastDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Broadcast sent successfully")
                        .apiData(service.sendBroadcast(request))
                        .build());
    }

    /**
     * Retrieves paginated broadcast history for a tenant.
     *
     * @param tenantId tenant identifier
     * @param page page number (0-indexed)
     * @param size page size
     * @return paginated broadcast records
     */
    @GetMapping("/broadcasts/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<Page<MessageBroadcastDto>>> getBroadcastHistory(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                ApiResponse.<Page<MessageBroadcastDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Broadcast history fetched successfully")
                        .apiData(service.getBroadcastHistory(tenantId, pageable))
                        .build());
    }

    /**
     * Retrieves unread in-app notifications for a user.
     *
     * @param userId user identifier
     * @param tenantId tenant identifier
     * @return list of unread notifications
     */
    @GetMapping("/notifications/unread")
    public ResponseEntity<ApiResponse<List<InAppNotificationDto>>> getUnreadNotifications(
            @RequestParam String userId,
            @RequestParam String tenantId) {
        return ResponseEntity.ok(
                ApiResponse.<List<InAppNotificationDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Unread notifications fetched successfully")
                        .apiData(service.getUserUnreadNotifications(userId, tenantId))
                        .build());
    }

    /**
     * Retrieves all in-app notifications for a user.
     *
     * @param userId user identifier
     * @param tenantId tenant identifier
     * @return list of notifications
     */
    @GetMapping("/notifications/all")
    public ResponseEntity<ApiResponse<List<InAppNotificationDto>>> getAllNotifications(
            @RequestParam String userId,
            @RequestParam String tenantId) {
        return ResponseEntity.ok(
                ApiResponse.<List<InAppNotificationDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Notifications fetched successfully")
                        .apiData(service.getUserNotifications(userId, tenantId))
                        .build());
    }

    /**
     * Marks a specific in-app notification as read.
     *
     * @param id notification identifier
     * @return updated notification data
     */
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<InAppNotificationDto>> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<InAppNotificationDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Notification marked as read")
                        .apiData(service.markNotificationAsRead(id))
                        .build());
    }
}
