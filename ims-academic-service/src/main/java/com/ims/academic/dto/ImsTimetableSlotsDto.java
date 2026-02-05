package com.ims.academic.dto;

import lombok.*;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTimetableSlotsDto {

    private String id;
    private String tenantId;
    private String timetableMasterId;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String slotLabel;
    private Integer periodNumber;
    private List<ImsTimetableEntriesDto> entries;
}
