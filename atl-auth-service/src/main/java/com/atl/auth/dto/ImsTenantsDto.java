package com.atl.auth.dto;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsTenantsDto {
    private String id;
    private String bootstrapUsername;
    private String tenantName;
    private String tenantCode;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private Boolean isActive;
    private String currency;
    private String country;
    private String state;
    private Double latitude;
    private Double longitude;
}
