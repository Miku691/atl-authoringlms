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
 * Entity representing an installment plan for an academic offering.
 */
@Entity
@Table(name = "fee_installment_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeeInstallmentPlan {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String offeringId;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String tenantId;
}
