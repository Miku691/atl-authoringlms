package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsClassesDto;
import com.ims.academic.dto.ImsOfferingsDto;
import com.ims.academic.dto.ImsProgramsDto;
import com.ims.academic.dto.bootstrap.BootstrapReqDto;
import com.ims.academic.enums.AcademicBoard;
import com.ims.academic.enums.OfferingType;
import com.ims.academic.enums.ProgramLevel;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.repo.ImsProgramsRepo;
import com.ims.academic.service.ImsBootstrapService;
import com.ims.academic.service.ImsOfferingsService;
import com.ims.academic.service.ImsProgramsService;
import com.ims.academic.service.ImsClassesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ImsBootstrapServiceImpl implements ImsBootstrapService {

    private final ImsProgramsService programsService;
    private final ImsOfferingsService offeringsService;
    private final ImsClassesService classesService;
    private final ImsProgramsRepo programsRepo;
    private final ImsOfferingsRepo offeringsRepo;
    private final com.ims.academic.service.AcademicSessionService sessionService;

    @Override
    @Transactional
    public boolean bootstrapTenant(BootstrapReqDto reqDto) {
        // Prevent double bootstrap
        if (isSetupComplete(reqDto.getTenantId())) {
            return true;
        }

        try {
            switch (reqDto.getInstitutionType()) {
                case SCHOOL:
                    setupSchool(reqDto);
                    break;
                case COLLEGE:
                    setupCollege(reqDto);
                    break;
                case COACHING:
                    setupCoaching(reqDto);
                    break;
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean isSetupComplete(String tenantId) {
        // Simple check: Does tenant have at least one program and one offering?
        long programCount = programsRepo.countByTenantId(tenantId);
        long offeringCount = offeringsRepo.countByTenantId(tenantId);
        return programCount > 0 && offeringCount > 0;
    }

    private void setupSchool(BootstrapReqDto req) {
        BootstrapReqDto.SchoolConfig config = req.getSchoolConfig();
        if (config == null) {
            throw new IllegalArgumentException("School config is missing");
        }

        // 1. Create Main Program
        ImsProgramsDto program = ImsProgramsDto.builder()
                .tenantId(req.getTenantId())
                .code("SCHOOL-MAIN-" + req.getAcademicYear())
                .title("School Curriculum " + req.getAcademicYear())
                .level(ProgramLevel.SCHOOL)
                .board(AcademicBoard.CBSE) // Default or parse
                .description("Main School Program")
                .build();

        if (config.getBoard() != null) {
            try {
                program.setBoard(AcademicBoard.valueOf(config.getBoard().toUpperCase()));
            } catch (Exception ignored) {
                program.setBoard(AcademicBoard.OTHER);
            }
        }

        ImsProgramsDto savedProgram = programsService.create(program);

        // 1.1 Create Default Session
        com.ims.academic.dto.AcademicSessionDto session = com.ims.academic.dto.AcademicSessionDto.builder()
                .tenantId(req.getTenantId())
                .programId(savedProgram.getId())
                .name(req.getAcademicYear())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .isCurrent(true)
                .build();

        com.ims.academic.dto.AcademicSessionDto savedSession = sessionService.create(session);

        // 2. Create Classes and Sections
        int start = config.getStartClass() > 0 ? config.getStartClass() : 1;
        int end = config.getEndClass() > 0 ? config.getEndClass() : 12;
        int sections = config.getSectionsPerClass() > 0 ? config.getSectionsPerClass() : 1;

        for (int i = start; i <= end; i++) {
            for (int s = 0; s < sections; s++) {
                String sectionName = String.valueOf((char) ('A' + s));
                String className = "Class " + i + "-" + sectionName;

                // Create Offering (The schedulable unit)
                ImsOfferingsDto offering = ImsOfferingsDto.builder()
                        .tenantId(req.getTenantId())
                        .programId(savedProgram.getId())
                        .sessionId(savedSession.getId())
                        .type(OfferingType.SCHOOL_CLASS)
                        .name(className)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusYears(1))
                        .capacity(40)
                        .build();
                ImsOfferingsDto savedOffering = offeringsService.create(offering);

                // Create ImsClass
                ImsClassesDto classDto = ImsClassesDto.builder()
                        .tenantId(req.getTenantId())
                        .name(className)
                        .code("CLS-" + i + "-" + sectionName)
                        .offeringId(savedOffering.getId())
                        .build();
                classesService.create(classDto);
            }
        }
    }

    private void setupCollege(BootstrapReqDto req) {
        BootstrapReqDto.CollegeConfig config = req.getCollegeConfig();
        if (config == null || config.getPrograms() == null) {
            throw new IllegalArgumentException("College config/programs missing");
        }

        for (BootstrapReqDto.ProgramReq progReq : config.getPrograms()) {
            // Create Program
            ImsProgramsDto program = ImsProgramsDto.builder()
                    .tenantId(req.getTenantId())
                    .code(progReq.getCode() != null ? progReq.getCode() : "PROG-" + System.currentTimeMillis())
                    .title(progReq.getName())
                    .level(ProgramLevel.UNDERGRAD) // Default
                    .description("College Degree Program")
                    .build();

            ImsProgramsDto savedProgram = programsService.create(program);

            // Create Session for this Program
            com.ims.academic.dto.AcademicSessionDto session = com.ims.academic.dto.AcademicSessionDto.builder()
                    .tenantId(req.getTenantId())
                    .programId(savedProgram.getId())
                    .name(req.getAcademicYear())
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusYears(1))
                    .isCurrent(true)
                    .build();
            com.ims.academic.dto.AcademicSessionDto savedSession = sessionService.create(session);

            // Create Terms (Semesters)
            int terms = progReq.getNumberOfTerms() > 0 ? progReq.getNumberOfTerms() : 8;
            String label = progReq.getTermLabel() != null ? progReq.getTermLabel() : "Semester";

            for (int i = 1; i <= terms; i++) {
                ImsOfferingsDto offering = ImsOfferingsDto.builder()
                        .tenantId(req.getTenantId())
                        .programId(savedProgram.getId())
                        .sessionId(savedSession.getId())
                        .type(OfferingType.COLLEGE_PROGRAM)
                        .name(label + " " + i)
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusMonths(6))
                        .capacity(60)
                        .build();
                offeringsService.create(offering);
            }
        }
    }

    private void setupCoaching(BootstrapReqDto req) {
        BootstrapReqDto.CoachingConfig config = req.getCoachingConfig();
        if (config == null || config.getPrograms() == null) {
            throw new IllegalArgumentException("Coaching config/programs missing");
        }

        for (BootstrapReqDto.ProgramReq progReq : config.getPrograms()) {
            // Create Program
            ImsProgramsDto program = ImsProgramsDto.builder()
                    .tenantId(req.getTenantId())
                    .code(progReq.getCode() != null ? progReq.getCode() : "COACH-" + System.currentTimeMillis())
                    .title(progReq.getName())
                    .level(ProgramLevel.COACHING)
                    .description("Coaching Program")
                    .build();

            ImsProgramsDto savedProgram = programsService.create(program);

            // Create Session for this Program
            com.ims.academic.dto.AcademicSessionDto session = com.ims.academic.dto.AcademicSessionDto.builder()
                    .tenantId(req.getTenantId())
                    .programId(savedProgram.getId())
                    .name(req.getAcademicYear())
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusYears(1))
                    .isCurrent(true)
                    .build();
            com.ims.academic.dto.AcademicSessionDto savedSession = sessionService.create(session);

            // Create Batches
            int batches = progReq.getNumberOfTerms() > 0 ? progReq.getNumberOfTerms() : 2;
            String label = progReq.getTermLabel() != null ? progReq.getTermLabel() : "Batch";

            for (int i = 1; i <= batches; i++) {
                ImsOfferingsDto offering = ImsOfferingsDto.builder()
                        .tenantId(req.getTenantId())
                        .programId(savedProgram.getId())
                        .sessionId(savedSession.getId())
                        .type(OfferingType.COACHING_BATCH)
                        .name(label + " " + ((char) ('A' + i - 1))) // Batch A, Batch B...
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusYears(1))
                        .capacity(40)
                        .build();
                offeringsService.create(offering);
            }
        }
    }
}
