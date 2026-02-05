package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.List;

@Entity
@Table(name = "IMS_DEPARTMENTS", indexes = {
        @Index(name = "idx_dept_tenant", columnList = "tenant_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_dept_tenant_name", columnNames = { "tenant_id", "name" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false)
    private String code; // e.g., CSE, ECE

    @Column(name = "head_of_department_id")
    private String headOfDepartmentId; // Instructor ID

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<ImsPrograms> programs;
}
