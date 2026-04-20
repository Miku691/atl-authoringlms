package com.ims.academic.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentsDto {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String tenantId;
}
