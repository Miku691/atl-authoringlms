package com.ims.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImsPlatformStatsDto {
    private long studentCount;
    private long instructorCount;
    private long staffCount;
    private long guardianCount;
}
