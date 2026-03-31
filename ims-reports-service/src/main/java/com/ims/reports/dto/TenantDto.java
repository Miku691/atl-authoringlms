package com.ims.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantDto {
    private String id;
    private String tenantName;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String currency;
}
