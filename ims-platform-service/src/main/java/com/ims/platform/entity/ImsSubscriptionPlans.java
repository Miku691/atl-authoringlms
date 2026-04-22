package com.ims.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;

@Entity
@Table(name = "IMS_SUBSCRIPTION_PLANS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImsSubscriptionPlans {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "name", nullable = false, unique = true)
    private String name; // e.g., "FREE", "PRO", "ENTERPRISE"

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_monthly", nullable = false)
    private BigDecimal priceMonthly;

    @Column(name = "price_yearly")
    private BigDecimal priceYearly;

    @Column(name = "currency", nullable = false)
    private String currency = "INR";

    @Column(name = "max_students", nullable = false)
    private Integer maxStudents;

    @Column(name = "max_teachers", nullable = false)
    private Integer maxTeachers;

    @Column(name = "max_staff", nullable = false)
    private Integer maxStaff;

    @Column(name = "max_guardians", nullable = false)
    private Integer maxGuardians;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "features_list", columnDefinition = "TEXT")
    private String featuresList; // JSON array of features for UI

}
