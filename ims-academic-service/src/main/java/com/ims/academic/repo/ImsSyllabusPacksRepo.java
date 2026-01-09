package com.ims.academic.repo;

import com.ims.academic.entity.ImsSyllabusPacks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsSyllabusPacksRepo extends JpaRepository<ImsSyllabusPacks, String> {

    List<ImsSyllabusPacks> findByTenantId(String tenantId);
}
