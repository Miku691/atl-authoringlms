package com.ims.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "student_fee_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeRecord {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String feeHeadId;

    @Column(nullable = false)
    private String offeringId;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private BigDecimal amountDue;

    @Column(nullable = false)
    private BigDecimal amountPaid;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false)
    private BigDecimal lateFeeAmount = BigDecimal.ZERO; // Phase 12

    @Column(nullable = false)
    private Boolean lateFeeApplied = false; // Phase 12

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeStatus status; // PAID, PARTIAL, UNPAID

    @Column(nullable = false)
    private String tenantId;

    @Column
    private String installmentScheduleId; // Added for Phase 10: link to specific installment


    public enum FeeStatus {
        PAID, PARTIAL, UNPAID
    }
}
