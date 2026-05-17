package com.ims.academic.service.impl;

import com.ims.academic.client.NotificationClient;
import com.ims.academic.dto.BroadcastRequestDto;
import com.ims.academic.dto.InAppNotificationDto;
import com.ims.academic.dto.MessageBroadcastDto;
import com.ims.academic.dto.external.EmailRequestDto;
import com.ims.academic.entity.ImsInAppNotification;
import com.ims.academic.entity.ImsMessageBroadcast;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsInAppNotificationRepo;
import com.ims.academic.repo.ImsMessageBroadcastRepo;
import com.ims.academic.service.ImsMessageBroadcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImsMessageBroadcastServiceImpl implements ImsMessageBroadcastService {

    private final ImsMessageBroadcastRepo broadcastRepo;
    private final ImsInAppNotificationRepo notificationRepo;
    private final NotificationClient notificationClient;
    private final ModelMapper modelMapper;

    private MessageBroadcastDto toBroadcastDto(ImsMessageBroadcast entity) {
        return modelMapper.map(entity, MessageBroadcastDto.class);
    }

    private InAppNotificationDto toNotificationDto(ImsInAppNotification entity) {
        return modelMapper.map(entity, InAppNotificationDto.class);
    }

    @Override
    @Transactional
    public MessageBroadcastDto sendBroadcast(BroadcastRequestDto request) {
        log.info("Initiating broadcast for tenant: {} with subject: {}", request.getTenantId(), request.getSubject());

        // 1. Save Broadcast Record
        ImsMessageBroadcast broadcast = ImsMessageBroadcast.builder()
                .tenantId(request.getTenantId())
                .senderId(request.getSenderId())
                .subject(request.getSubject())
                .messageBody(request.getMessageBody())
                .targetAudience(request.getTargetAudience())
                .channel(request.getChannel())
                .status("SENT")
                .attachmentUrl(request.getAttachmentUrl())
                .sentAt(LocalDateTime.now())
                .build();

        broadcast = broadcastRepo.save(broadcast);

        // 2. Process In-App Notifications
        if ("IN_APP".equalsIgnoreCase(request.getChannel()) || "BOTH".equalsIgnoreCase(request.getChannel())) {
            if (request.getRecipientUserIds() != null && !request.getRecipientUserIds().isEmpty()) {
                String broadcastId = broadcast.getId();
                List<ImsInAppNotification> notifications = request.getRecipientUserIds().stream()
                        .map(userId -> ImsInAppNotification.builder()
                                .broadcastId(broadcastId)
                                .recipientUserId(userId)
                                .tenantId(request.getTenantId())
                                .subject(request.getSubject())
                                .messageBody(request.getMessageBody())
                                .isRead(false)
                                .createdAt(LocalDateTime.now())
                                .build())
                        .collect(Collectors.toList());
                notificationRepo.saveAll(notifications);
                log.info("Saved {} in-app notifications", notifications.size());
            }
        }

        // 3. Process Email Dispatch
        if ("EMAIL".equalsIgnoreCase(request.getChannel()) || "BOTH".equalsIgnoreCase(request.getChannel())) {
            if (request.getRecipientEmails() != null && !request.getRecipientEmails().isEmpty()) {
                for (String email : request.getRecipientEmails()) {
                    try {
                        EmailRequestDto emailReq = EmailRequestDto.builder()
                                .to(email)
                                .subject(request.getSubject())
                                .body(request.getMessageBody())
                                .tenantId(request.getTenantId())
                                .build();
                        notificationClient.sendEmail(emailReq);
                    } catch (Exception e) {
                        log.error("Failed to dispatch email to {}: {}", email, e.getMessage());
                    }
                }
                log.info("Dispatched {} email requests", request.getRecipientEmails().size());
            }
        }

        return toBroadcastDto(broadcast);
    }

    @Override
    public Page<MessageBroadcastDto> getBroadcastHistory(String tenantId, Pageable pageable) {
        return broadcastRepo.findByTenantIdOrderBySentAtDesc(tenantId, pageable)
                .map(this::toBroadcastDto);
    }

    @Override
    public List<InAppNotificationDto> getUserUnreadNotifications(String userId, String tenantId) {
        return notificationRepo.findByRecipientUserIdAndTenantIdAndIsReadFalseOrderByCreatedAtDesc(userId, tenantId)
                .stream()
                .map(this::toNotificationDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InAppNotificationDto> getUserNotifications(String userId, String tenantId) {
        return notificationRepo.findByRecipientUserIdAndTenantIdOrderByCreatedAtDesc(userId, tenantId)
                .stream()
                .map(this::toNotificationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InAppNotificationDto markNotificationAsRead(String notificationId) {
        ImsInAppNotification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("InAppNotification", notificationId));
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        return toNotificationDto(notificationRepo.save(notification));
    }
}
