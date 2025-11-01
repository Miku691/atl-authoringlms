package com.atl.mcq.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlQuestion {
    @Id
    private String id;
    private String type; // "MCQ" or "TRUE_FALSE"
    private String questionText;
    private List<String> options; // Only for MCQ
    private int correctOptionIndex; // For MCQ
    private boolean correctAnswer; // For TRUE_FALSE

    @Indexed
    private Long slideId;
    private String category;
    private String difficulty;
}
