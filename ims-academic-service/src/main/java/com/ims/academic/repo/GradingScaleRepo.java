package com.ims.academic.repo;

import com.ims.academic.entity.GradingScale;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GradingScaleRepo extends JpaRepository<GradingScale, String> {
    List<GradingScale> findByTenantId(String tenantId);

    boolean existsByTenantIdAndGradeLabel(String tenantId, String gradeLabel);
}
