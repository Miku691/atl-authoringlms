package com.ims.instructor.dto;

import com.ims.instructor.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorDocumentsDto {
    private String id;
    private String instructorId;
    private DocumentType documentType;
    private String fileUrl;
    private Instant uploadedAt;
}
