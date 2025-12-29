package com.ims.staff.entity;

import com.ims.staff.enums.StaffDocumentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(
        name = "IMS_STAFF_DOCUMENTS",
        indexes = {
                @Index(name = "idx_staff_docs_staff", columnList = "staff_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaffDocuments {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    @Column(name = "staff_id", nullable = false)
    private String staffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private StaffDocumentType documentType;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;
}