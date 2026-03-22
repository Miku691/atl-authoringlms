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

/**
 * Entity representing an active concession/discount applied to a specific student.
 */
@Entity
@Table(name = "student_fee_concessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeConcession {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String feeDiscountId;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private String status = "ACTIVE";

    private String remarks;
}
