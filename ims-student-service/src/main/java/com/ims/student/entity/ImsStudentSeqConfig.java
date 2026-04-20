package com.ims.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "IMS_STUDENT_SEQ_CONFIG", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "prefix"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentSeqConfig {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private String tenantId;

    @Column(name = "prefix", length = 20)
    private String prefix; // E.g., ADM, SCH, COLL

    @Column(name = "pattern", length = 100)
    private String pattern; // E.g., {PREFIX}-{YEAR}-{SEQ}

    @Column(name = "last_sequence")
    private Long lastSequence;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
