package com.authoring.tool.dto.mcq;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
public class AtlMcqServiceQuestionDto {
    private String id;
    private String type;
    private String questionText;
    private List<String> options;
    private int correctOptionIndex;
    private Long slideId;
    private boolean correctAnswer;
    private String category;
    private String difficulty;
}
