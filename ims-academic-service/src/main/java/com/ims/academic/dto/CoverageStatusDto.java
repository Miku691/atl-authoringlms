package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoverageStatusDto {
    private boolean isCovered;
    private List<String> missingSubjects; // List of Subject IDs or Names
    private String message;
}
