package com.ims.academic.service.impl;

import com.ims.academic.entity.*;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.*;
import com.ims.academic.service.AcademicSessionCloneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicSessionCloneServiceImpl implements AcademicSessionCloneService {

    private final AcademicSessionRepo sessionRepo;
    private final ImsOfferingsRepo offeringsRepo;
    private final ImsOfferingSubjectRepo offeringSubjectRepo;
    private final ImsOfferingInstructorsRepo offeringInstructorsRepo;
    private final ImsOfferingClassMappingsRepo offeringClassMappingsRepo;

    @Override
    @Transactional
    public void cloneStructure(String sourceSessionId, String targetSessionId, String tenantId) {
        log.info("Starting structural clone from session {} to {} for tenant {}", sourceSessionId, targetSessionId, tenantId);

        AcademicSession sourceSession = sessionRepo.findById(sourceSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Source Session", sourceSessionId));
        
        AcademicSession targetSession = sessionRepo.findById(targetSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Target Session", targetSessionId));

        if (!sourceSession.getTenantId().equals(tenantId) || !targetSession.getTenantId().equals(tenantId)) {
             throw new IllegalStateException("Cross-tenant cloning is not allowed.");
        }

        // 1. Fetch all offerings of the source session
        List<ImsOfferings> sourceOfferings = offeringsRepo.findBySessionId(sourceSessionId);
        
        for (ImsOfferings sourceOff : sourceOfferings) {
            // 2. Clone the Offering
            ImsOfferings targetOff = ImsOfferings.builder()
                    .tenantId(tenantId)
                    .session(targetSession)
                    .name(sourceOff.getName())
                    .type(sourceOff.getType())
                    .capacity(sourceOff.getCapacity())
                    .metadata(sourceOff.getMetadata())
                    .startDate(targetSession.getStartDate()) // Use target session dates by default
                    .endDate(targetSession.getEndDate())
                    .build();
            
            targetOff = offeringsRepo.save(targetOff);
            log.debug("Cloned offering: {} -> {}", sourceOff.getId(), targetOff.getId());

            // 3. Clone Offering-Subject Mappings
            List<ImsOfferingSubject> sourceSubjects = offeringSubjectRepo.findByOfferingId(sourceOff.getId());
            for (ImsOfferingSubject sourceSub : sourceSubjects) {
                ImsOfferingSubject targetSub = ImsOfferingSubject.builder()
                        .offering(targetOff)
                        .subject(sourceSub.getSubject())
                        .isOptional(sourceSub.isOptional())
                        .credits(sourceSub.getCredits())
                        .instructorId(sourceSub.getInstructorId())
                        .build();
                offeringSubjectRepo.save(targetSub);
            }

            // 4. Clone Offering-Instructor Mappings (Operational roles)
            List<ImsOfferingInstructors> sourceInstructors = offeringInstructorsRepo.findByOfferingId(sourceOff.getId());
            for (ImsOfferingInstructors sourceIns : sourceInstructors) {
                ImsOfferingInstructors targetIns = ImsOfferingInstructors.builder()
                        .offeringId(targetOff.getId())
                        .instructorId(sourceIns.getInstructorId())
                        .subjectId(sourceIns.getSubjectId())
                        .role(sourceIns.getRole())
                        .startDate(targetOff.getStartDate())
                        .endDate(targetOff.getEndDate())
                        .build();
                offeringInstructorsRepo.save(targetIns);
            }

            // 5. Clone Offering-Class Mappings (Structural helpers)
            List<ImsOfferingClassMappings> sourceClassMaps = offeringClassMappingsRepo.findByOfferingId(sourceOff.getId());
            for (ImsOfferingClassMappings sourceClassMap : sourceClassMaps) {
                ImsOfferingClassMappings targetClassMap = ImsOfferingClassMappings.builder()
                        .offeringId(targetOff.getId())
                        .classId(sourceClassMap.getClassId())
                        .sectionId(sourceClassMap.getSectionId())
                        .build();
                offeringClassMappingsRepo.save(targetClassMap);
            }
        }
        
        log.info("Successfully cloned structural data to new session {}", targetSessionId);
    }
}
