package com.ims.academic.repo;

import com.ims.academic.entity.ImsClasses;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsClassesRepo extends JpaRepository<ImsClasses, String> {

    boolean existsByTenantIdAndName(String tenantId, String name);

    List<ImsClasses> findByTenantId(String tenantId);
}