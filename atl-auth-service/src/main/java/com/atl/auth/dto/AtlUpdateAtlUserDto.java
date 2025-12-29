package com.atl.auth.dto;

import com.atl.auth.entity.ImsTenants;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlUpdateAtlUserDto {
    private String username;
    private String email;
    private String status;
    private ImsTenants tenant;
}
