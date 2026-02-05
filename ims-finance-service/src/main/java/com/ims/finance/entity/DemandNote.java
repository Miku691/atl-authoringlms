package com.ims.finance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity to track monthly/bi-monthly demand notes (invoices) generated for
 * students.
 */
@Entity
@Table(name = "demand_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandNote {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String billingMonth; // e.g. "January 2024" or "Jan-Feb 2024"

    @Column(nullable = false)
    private String feeHeadId;

    @Column(nullable = false)
    private String feeHeadName;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private BigDecimal amountPaid;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DemandStatus status; // PENDING, PAID, PARTIAL

    @Column(nullable = false)
    private String tenantId;

    public enum DemandStatus {
        PENDING, PAID, PARTIAL
    }
}
