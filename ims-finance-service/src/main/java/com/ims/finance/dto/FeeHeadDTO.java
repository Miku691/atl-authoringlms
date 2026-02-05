package com.ims.finance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for FeeHead.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeHeadDTO {

    private String id;

    @NotBlank(message = "Fee head name is mandatory")
    private String name;

    private String description;

    private String tenantId;
}
