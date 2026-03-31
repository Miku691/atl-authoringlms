package com.ims.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDto {
    private String reportName;
    private String format; // "EXCEL" or "CSV"
    private Map<String, Object> parameters; // Custom parameters
    
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
}
