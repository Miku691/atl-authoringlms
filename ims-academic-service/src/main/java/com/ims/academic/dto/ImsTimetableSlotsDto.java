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
    private String timetableMasterId;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String slotLabel;
    private List<ImsTimetableEntriesDto> entries;
}
