package com.ims.academic.dto;

import com.ims.academic.enums.AcademicBoard;
import com.ims.academic.enums.ProgramLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsProgramsDto {

    private String id;
    private String tenantId;
    private String code;
    private String title;
    private ProgramLevel level;
    private AcademicBoard board;
    private String description;
    private Instant createdAt;
}
