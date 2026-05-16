package com.ims.academic.exception;

import lombok.Getter;
import java.util.List;

@Getter
public class ReadinessValidationException extends RuntimeException {
    private final List<String> missingComponents;

    public ReadinessValidationException(List<String> missingComponents) {
        super("Cannot activate session. Missing components: " + String.join(", ", missingComponents));
        this.missingComponents = missingComponents;
    }
}
