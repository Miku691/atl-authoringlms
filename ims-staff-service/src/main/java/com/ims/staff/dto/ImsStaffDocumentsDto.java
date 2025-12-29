package com.ims.staff.dto;

import com.ims.staff.enums.StaffDocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaffDocumentsDto {
    private String id;
    private String staffId;
    private StaffDocumentType documentType;
    private String fileUrl;
    private Instant uploadedAt;
}
