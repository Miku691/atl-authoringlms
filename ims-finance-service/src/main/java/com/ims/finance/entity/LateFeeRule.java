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
 * Entity to define late fee penalty rules.
 */
@Entity
@Table(name = "late_fee_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LateFeeRule {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // FIXED, PERCENTAGE

    @Column(nullable = false)
    private java.math.BigDecimal value;

    @Column(nullable = false)
    private Integer gracePeriodDays;

    @Column(nullable = false)
    private String tenantId;
}
