package com.atl.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MapRoleDto {
    private String username;
    private String roleCode;
}
