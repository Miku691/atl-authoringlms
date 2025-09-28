package com.authoring.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlCourseWOSlideDto {
    private long id;
    private String title;
    private String desc;
    private String author;
    private LocalDateTime createdOn;
    private LocalDateTime updatedOn;
    private String status;
}
