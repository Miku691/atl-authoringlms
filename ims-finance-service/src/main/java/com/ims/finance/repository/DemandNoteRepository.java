package com.ims.finance.repository;

import com.ims.finance.entity.DemandNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DemandNoteRepository extends JpaRepository<DemandNote, String> {
    List<DemandNote> findAllByStudentIdAndTenantId(String studentId, String tenantId);

    List<DemandNote> findAllByStudentIdAndTenantIdAndStatusNotOrderByDueDateAsc(String studentId, String tenantId,
            DemandNote.DemandStatus status);

    List<DemandNote> findAllByTenantId(String tenantId);
}
