package com.ims.academic.exception;

public class ResourceAlreadyExistException extends RuntimeException{
    private String entity;
    private String inputData;
    private String field;

    public ResourceAlreadyExistException(String inputData, String entity, String field) {
        super(entity + " already exist for the given data " + field +" - " + inputData);
        this.entity = entity;
        this.inputData = inputData;
        this.field = field;
    }
}
