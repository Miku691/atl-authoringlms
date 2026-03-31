package com.ims.finance.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing an institutional expense.
 */
@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = false)
    private String paymentMethod; // e.g., CASH, BANK_TRANSFER, CHEQUE

    private String referenceNo;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(nullable = false)
    private String tenantId;
}
