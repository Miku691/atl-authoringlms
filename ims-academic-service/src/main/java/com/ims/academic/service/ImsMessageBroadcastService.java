package com.ims.academic.service;

import com.ims.academic.dto.BroadcastRequestDto;
import com.ims.academic.dto.InAppNotificationDto;
import com.ims.academic.dto.MessageBroadcastDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ImsMessageBroadcastService {

    /**
     * Sends a message broadcast and generates notifications.
     *
     * @param request broadcast request details
     * @return broadcast record DTO
     */
    MessageBroadcastDto sendBroadcast(BroadcastRequestDto request);

    /**
     * Retrieves broadcast history for a tenant.
     *
     * @param tenantId tenant identifier
     * @param pageable pagination parameters
     * @return paginated broadcast history
     */
    Page<MessageBroadcastDto> getBroadcastHistory(String tenantId, Pageable pageable);

    /**
     * Retrieves unread in-app notifications for a user.
     *
     * @param userId user identifier
     * @param tenantId tenant identifier
     * @return list of unread in-app notifications
     */
    List<InAppNotificationDto> getUserUnreadNotifications(String userId, String tenantId);

    /**
     * Retrieves all in-app notifications for a user.
     *
     * @param userId user identifier
     * @param tenantId tenant identifier
     * @return list of in-app notifications
     */
    List<InAppNotificationDto> getUserNotifications(String userId, String tenantId);

    /**
     * Marks an in-app notification as read.
     *
     * @param notificationId notification identifier
     * @return updated notification DTO
     */
    InAppNotificationDto markNotificationAsRead(String notificationId);
}
