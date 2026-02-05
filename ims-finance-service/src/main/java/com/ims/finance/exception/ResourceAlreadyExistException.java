package com.ims.finance.exception;

import lombok.Getter;

@Getter
public class ResourceAlreadyExistException extends RuntimeException {
    private String field;
    private String data;

    public ResourceAlreadyExistException(String field, String data) {
        super("Details already exist with " + field + " - " + data);
        this.field = field;
        this.data = data;
    }
}
