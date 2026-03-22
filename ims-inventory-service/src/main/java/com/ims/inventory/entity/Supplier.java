package com.ims.inventory.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "suppliers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {
    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String tenantId;
}
