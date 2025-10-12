package com.authoring.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlCourseWOSlideDto {
    private long id;
    private String title;
    private String description;
    private String author;
    @JsonFormat(pattern = "dd/MM/YYYY")
    private LocalDateTime createdOn;
    @JsonFormat(pattern = "dd/MM/YYYY")
    private LocalDateTime updatedOn;
    private String status;
}
