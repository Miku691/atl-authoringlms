package com.ims.student.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkAdmissionDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String gender;
    private String dob; // "yyyy-MM-dd"
    private String admissionNo;
    private String offeringId; // Where to enroll
    private List<ImsGuardiansDto> guardians;
}
