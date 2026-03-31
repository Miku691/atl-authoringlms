package com.ims.reports.repository;

import com.ims.reports.entity.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, UUID> {
    Optional<ReportTemplate> findByTenantIdAndTemplateType(String tenantId, String templateType);
}
