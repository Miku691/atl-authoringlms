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

    private void sendTextEmail(EmailRequestDto request) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getTo());
        message.setSubject(request.getSubject());
        message.setText(request.getBody());
        mailSender.send(message);
    }

    private void sendHtmlEmail(EmailRequestDto request) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(request.getTo());
        helper.setSubject(request.getSubject());
        helper.setText(request.getBody(), true);
        mailSender.send(message);
    }
}
