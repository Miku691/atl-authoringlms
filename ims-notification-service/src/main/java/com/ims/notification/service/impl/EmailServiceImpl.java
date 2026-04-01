package com.ims.notification.service.impl;

import com.ims.notification.dto.EmailRequestDto;
import com.ims.notification.service.EmailService;
import com.ims.notification.service.EmailTemplateProcessor;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.core.io.FileSystemResource;
import java.io.File;
import java.util.Objects;

/**
 * Implementation of EmailService using JavaMailSender and @Async for
 * non-blocking dispatch.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateProcessor templateProcessor;

    @Override
    @Async("notificationTaskExecutor")
    public void sendEmail(EmailRequestDto request) {
        log.info("Attempting to send email to: {} with subject: {}", request.getTo(), request.getSubject());

        try {
            if (request.getTemplateName() != null && !request.getTemplateName().isBlank()) {
                String htmlBody = templateProcessor.process(request.getTemplateName(), request.getTemplateData());
                request.setBody(htmlBody);
                request.setHtml(true);
            }

            if (request.isHtml()) {
                sendHtmlEmail(request);
            } else {
                sendTextEmail(request);
            }
            log.info("Email sent successfully to: {}", request.getTo());
        } catch (Exception e) {
            log.error("Failed to send email to: {}. Subject: {}. Error: {}",
                    request.getTo(), request.getSubject(), e.getMessage(), e);
        }
    }


    private void sendHtmlEmail(EmailRequestDto request) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(request.getTo());
        helper.setSubject(request.getSubject());
        helper.setText(request.getBody(), true);

        if (request.getAttachmentPath() != null && !request.getAttachmentPath().isEmpty()) {
            File file = new File(request.getAttachmentPath());
            if (file.exists()) {
                FileSystemResource res = new FileSystemResource(file);
                helper.addAttachment(Objects.requireNonNull(res.getFilename()), res);
                log.info("Attached file: {} to email", request.getAttachmentPath());
            } else {
                log.warn("Attachment file not found at path: {}", request.getAttachmentPath());
            }
        }

        mailSender.send(message);
    }

    private void sendTextEmail(EmailRequestDto request) throws MessagingException {
        if (request.getAttachmentPath() != null && !request.getAttachmentPath().isEmpty()) {
            // If attachment exists, we must use MimeMessage even for text
            sendHtmlEmail(request); 
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getTo());
        message.setSubject(request.getSubject());
        message.setText(request.getBody());
        mailSender.send(message);
    }
}
