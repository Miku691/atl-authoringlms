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
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing a specific installment within a fee installment plan.
 */
@Entity
@Table(name = "fee_installment_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeeInstallmentSchedule {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String planId; // Reference to FeeInstallmentPlan

    @Column(nullable = false)
    private String feeHeadId; // Reference to FeeHead

    @Column(nullable = false)
    private Integer installmentNumber;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String tenantId;
}
