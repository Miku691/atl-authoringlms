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

/**
 * Entity representing the mapping of a FeeHead to an Academic Offering.
 */
@Entity
@Table(name = "fee_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructure {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false)
    private String feeHeadId;

    @Column(nullable = false)
    private String offeringId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String tenantId;
}
