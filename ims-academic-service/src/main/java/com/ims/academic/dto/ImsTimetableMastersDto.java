package com.ims.academic.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTimetableMastersDto {

    private String id;
    private String tenantId;
    private String offeringId;
    private String academicYearId;
    private String name;
    private String timezone;
    private List<ImsTimetableSlotsDto> slots;
}
