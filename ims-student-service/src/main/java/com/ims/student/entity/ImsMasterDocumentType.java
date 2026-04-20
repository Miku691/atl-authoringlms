package com.ims.student.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity to store master document types for student records.
 */
@Entity
@Table(name = "ims_master_document_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsMasterDocumentType {

    @Id
    private String id; // UUID
    private String code; // e.g., PASSPORT_PHOTO, BIRTH_CERT
    private String label; // e.g., Passport Photo, Birth Certificate
    private String description;
    private boolean isMandatory;
    private String tenantId;
}
