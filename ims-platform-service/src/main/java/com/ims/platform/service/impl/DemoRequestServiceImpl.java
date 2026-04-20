package com.ims.platform.service.impl;

import com.ims.platform.client.NotificationClient;
import com.ims.platform.dto.DemoRequestDto;
import com.ims.platform.dto.EmailRequestDto;
import com.ims.platform.entity.DemoRequest;
import com.ims.platform.enums.DemoRequestStatus;
import com.ims.platform.repo.DemoRequestRepository;
import com.ims.platform.service.DemoRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoRequestServiceImpl implements DemoRequestService {

    private final DemoRequestRepository repository;
    private final ModelMapper modelMapper;
    private final NotificationClient notificationClient;

    @Value("${platform.owner.email:makaradhwaja094@gmail.com}")
    private String platformOwnerEmail;

    @Override
    @Transactional
    public DemoRequestDto submitRequest(DemoRequestDto requestDto) {
        log.info("Receiving new demo request from: {}", requestDto.getEmail());
        
        DemoRequest demoRequest = modelMapper.map(requestDto, DemoRequest.class);
        demoRequest.setStatus(DemoRequestStatus.PENDING);
        
        DemoRequest saved = repository.save(demoRequest);
        
        // Trigger emails
        sendNotificationToOwner(saved);
        sendConfirmationToUser(saved);
        
        return modelMapper.map(saved, DemoRequestDto.class);
    }

    @Override
    public List<DemoRequestDto> getAllRequests() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(entity -> modelMapper.map(entity, DemoRequestDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DemoRequestDto updateStatus(String id, DemoRequestStatus status, String feedback) {
        DemoRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demo Request not found"));
        
        if (status == DemoRequestStatus.COMPLETED && (feedback == null || feedback.trim().isEmpty())) {
            throw new RuntimeException("Feedback is mandatory for marking demo as completed");
        }

        request.setStatus(status);
        if (feedback != null) {
            request.setAdminFeedback(feedback);
        }
        
        return modelMapper.map(repository.save(request), DemoRequestDto.class);
    }

    @Override
    @Transactional
    public DemoRequestDto confirmMeeting(String id, String meetingLink) {
        if (meetingLink == null || !meetingLink.contains("meet.google.com/")) {
            throw new RuntimeException("A valid Google Meet link is required to confirm the demo.");
        }

        DemoRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demo Request not found"));
        
        request.setStatus(DemoRequestStatus.SCHEDULED);
        request.setMeetingLink(meetingLink);
        
        DemoRequest saved = repository.save(request);
        
        // Notify user with link
        sendMeetingLinkEmail(saved);
        
        return modelMapper.map(saved, DemoRequestDto.class);
    }

    private void sendNotificationToOwner(DemoRequest request) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("name", request.getFullName());
            data.put("email", request.getEmail());
            data.put("phone", request.getPhoneNumber());
            data.put("date", request.getPreferredDate());
            data.put("time", request.getPreferredTime());
            data.put("institute", request.getInstituteName());

            EmailRequestDto email = EmailRequestDto.builder()
                    .to(platformOwnerEmail)
                    .subject("New Demo Request: " + request.getFullName())
                    .templateName("demo-request-owner")
                    .templateData(data)
                    .isHtml(true)
                    .build();
            
            notificationClient.sendEmail(email);
        } catch (Exception e) {
            log.error("Failed to send notification to owner", e);
        }
    }

    private void sendConfirmationToUser(DemoRequest request) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("name", request.getFullName());
            data.put("date", request.getPreferredDate());
            data.put("time", request.getPreferredTime());

            EmailRequestDto email = EmailRequestDto.builder()
                    .to(request.getEmail())
                    .subject("Demo Request Submitted Successfully - EduFlow")
                    .templateName("demo-request-user")
                    .templateData(data)
                    .isHtml(true)
                    .build();
            
            notificationClient.sendEmail(email);
        } catch (Exception e) {
            log.error("Failed to send confirmation to user", e);
        }
    }

    private void sendMeetingLinkEmail(DemoRequest request) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("name", request.getFullName());
            data.put("date", request.getPreferredDate());
            data.put("time", request.getPreferredTime());
            data.put("link", request.getMeetingLink());

            EmailRequestDto email = EmailRequestDto.builder()
                    .to(request.getEmail())
                    .subject("Your Product Demo is Scheduled - EduFlow")
                    .templateName("demo-scheduled-link")
                    .templateData(data)
                    .isHtml(true)
                    .build();
            
            notificationClient.sendEmail(email);
        } catch (Exception e) {
            log.error("Failed to send meeting link email", e);
        }
    }
}
