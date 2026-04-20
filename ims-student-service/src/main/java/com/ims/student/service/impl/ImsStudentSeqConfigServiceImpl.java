package com.ims.student.service.impl;

import com.ims.student.entity.ImsStudentSeqConfig;
import com.ims.student.repo.ImsStudentSeqConfigRepo;
import com.ims.student.service.ImsStudentSeqConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;

@Service
@RequiredArgsConstructor
public class ImsStudentSeqConfigServiceImpl implements ImsStudentSeqConfigService {

    private final ImsStudentSeqConfigRepo repo;

    @Override
    @Transactional
    public String generateNextAdmissionNo(String tenantId) {
        ImsStudentSeqConfig config = repo.findByTenantId(tenantId)
                .orElseGet(() -> {
                    // Default configuration if not present
                    return ImsStudentSeqConfig.builder()
                            .tenantId(tenantId)
                            .prefix("ADM")
                            .pattern("{PREFIX}-{YEAR}-{SEQ}")
                            .lastSequence(0L)
                            .build();
                });

        long nextSeq = config.getLastSequence() + 1;
        config.setLastSequence(nextSeq);
        repo.save(config);

        String year = String.valueOf(Calendar.getInstance().get(Calendar.YEAR));
        String seqStr = String.format("%04d", nextSeq); // Default 4 digits

        return config.getPattern()
                .replace("{PREFIX}", config.getPrefix() != null ? config.getPrefix() : "")
                .replace("{YEAR}", year)
                .replace("{SEQ}", seqStr);
    }
}
