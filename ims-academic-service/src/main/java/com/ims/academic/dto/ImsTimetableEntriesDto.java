package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTimetableEntriesDto {

    private String id;
    private String timetableSlotId;
    private String offeringId;
    private String subjectId;
    private String instructorId;
    private String room;
}
