package com.ims.reports.exception;

import org.springframework.http.HttpStatus;

public class ImsReportsException extends RuntimeException {
    private final HttpStatus status;

    public ImsReportsException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public ImsReportsException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
