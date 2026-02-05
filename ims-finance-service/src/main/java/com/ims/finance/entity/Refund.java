package com.ims.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * Entity to track refunds issued to students.
 */
@Entity
@Table(name = "refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Refund {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String studentFeeRecordId; // Refund linked to a specific fee record

    @Column(nullable = false)
    private java.math.BigDecimal amount;

    @Column(nullable = false)
    private String refundMode; // CASH, BANK_TRANSFER

    private String reason;

    @Column(nullable = false)
    private LocalDateTime refundDate;

    @Column(nullable = false)
    private String processedBy;

    @Column(nullable = false)
    private String tenantId;
}
