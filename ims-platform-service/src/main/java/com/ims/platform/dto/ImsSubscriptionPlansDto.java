package com.ims.platform.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ImsSubscriptionPlansDto {
    private String id;
    private String name;
    private String description;
    private BigDecimal priceMonthly;
    private BigDecimal priceYearly;
    private String currency;
    private Integer maxStudents;
    private Integer maxTeachers;
    private Integer maxStaff;
    private Integer maxGuardians;
    private Boolean isActive;
    private String featuresList;
}
