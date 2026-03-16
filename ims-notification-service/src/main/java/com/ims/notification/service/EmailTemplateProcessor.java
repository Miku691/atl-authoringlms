package com.ims.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Service to process Thymeleaf templates with provided data.
 */
@Service
@RequiredArgsConstructor
public class EmailTemplateProcessor {

    private final TemplateEngine templateEngine;

    /**
     * Renders a Thymeleaf template with the given data.
     *
     * @param templateName Name of the template (without .html extension)
     * @param data         A map of variables to inject into the template
     * @return Rendered HTML string
     */
    public String process(String templateName, Map<String, Object> data) {
        Context context = new Context();
        if (data != null) {
            context.setVariables(data);
        }
        return templateEngine.process(templateName, context);
    }
}
