package com.atl.mcq.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
public class AtlMcqQuestionDto {
    private String id;
    private String type;
    private String questionText;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<String> options;
    private int correctOptionIndex;

    private boolean correctAnswer;
    private String category;
    private String difficulty;
}
