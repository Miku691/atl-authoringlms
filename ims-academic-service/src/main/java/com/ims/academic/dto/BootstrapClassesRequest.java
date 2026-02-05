package com.ims.academic.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BootstrapClassesRequest {
    private String tenantId;
    private String programId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer startClass;
    private Integer endClass;
}
