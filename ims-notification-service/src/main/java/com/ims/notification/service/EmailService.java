package com.ims.notification.service;

import com.ims.notification.dto.EmailRequestDto;

/**
 * Service interface for sending emails.
 */
public interface EmailService {
    /**
     * Sends an email asynchronously.
     * 
     * @param request email details
     */
    void sendEmail(EmailRequestDto request);
}
