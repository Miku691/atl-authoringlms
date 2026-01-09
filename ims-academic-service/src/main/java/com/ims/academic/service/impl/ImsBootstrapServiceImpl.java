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
        // 1. Create Main Program (e.g. "Main School Curriculum")
        ImsProgramsDto program = ImsProgramsDto.builder()
                .tenantId(req.getTenantId())
                .code("SCHOOL-MAIN-" + req.getAcademicYear())
                .title("School Curriculum " + req.getAcademicYear())
                .level(ProgramLevel.SCHOOL)
                .board(AcademicBoard.CBSE) // Default or parse from req.getBoard()
                .description("Default school program created by bootstrap")
                .build();

        if (req.getBoard() != null) {
            try {
                program.setBoard(AcademicBoard.valueOf(req.getBoard().toUpperCase()));
            } catch (Exception ignored) {
                program.setBoard(AcademicBoard.OTHER); // Fallback
            }
        }

        ImsProgramsDto savedProgram = programsService.create(program);

        // 2. Create Classes (Offerings) & ImsClasses
        // e.g. Class 1 to Class 12
        int levels = req.getNumberOfLevels() > 0 ? req.getNumberOfLevels() : 12;

        for (int i = 1; i <= levels; i++) {
            // Create Offering (The logical "Class 10")
            ImsOfferingsDto offering = ImsOfferingsDto.builder()
                    .tenantId(req.getTenantId())
                    .programId(savedProgram.getId())
                    .type(OfferingType.SCHOOL_CLASS)
                    .name("Class " + i)
                    .startDate(LocalDate.now()) // Should ideally come from academic year start
                    .endDate(LocalDate.now().plusYears(1))
                    .capacity(40) // Default
                    .build();
            ImsOfferingsDto savedOffering = offeringsService.create(offering);

            // Create ImsClass (The entity for mapping)
            // Name: "Class X", Code: "CLASS-X", Linked to Offering
            ImsClassesDto classDto = ImsClassesDto.builder()
                    .tenantId(req.getTenantId())
                    .name("Class " + i)
                    .code("CLASS-" + i)
                    .offeringId(savedOffering.getId())
                    .build();
            classesService.create(classDto);
        }
    }

    private void setupCollege(BootstrapReqDto req) {
        // For college, "Program" usually means "B.Tech", "B.Sc" etc.
        // We'll create a default one "General Science" or similar if not specified
        ImsProgramsDto program = ImsProgramsDto.builder()
                .tenantId(req.getTenantId())
                .code("COLLEGE-GEN-" + req.getAcademicYear())
                .title("General Degree " + req.getAcademicYear())
                .level(ProgramLevel.UNDERGRAD)
                .description("Default college program created by bootstrap")
                .build();

        ImsProgramsDto savedProgram = programsService.create(program);

        // Create Semesters (Offerings)
        int semesters = req.getNumberOfLevels() > 0 ? req.getNumberOfLevels() : 8; // Default 4 years

        for (int i = 1; i <= semesters; i++) {
            ImsOfferingsDto offering = ImsOfferingsDto.builder()
                    .tenantId(req.getTenantId())
                    .programId(savedProgram.getId())
                    .type(OfferingType.COLLEGE_PROGRAM)
                    .name("Semester " + i)
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusMonths(6))
                    .capacity(60)
                    .build();
            offeringsService.create(offering);
        }
    }

    private void setupCoaching(BootstrapReqDto req) {
        // Coaching: Program = "IIT-JEE 2025" etc.
        ImsProgramsDto program = ImsProgramsDto.builder()
                .tenantId(req.getTenantId())
                .code("COACHING-" + req.getAcademicYear())
                .title("Coaching Program " + req.getAcademicYear())
                .level(ProgramLevel.COACHING)
                .description("Default coaching program created by bootstrap")
                .build();

        ImsProgramsDto savedProgram = programsService.create(program);

        // Create Batches (Offerings)
        int batches = req.getNumberOfLevels() > 0 ? req.getNumberOfLevels() : 2; // Morning, Evening

        for (int i = 1; i <= batches; i++) {
            ImsOfferingsDto offering = ImsOfferingsDto.builder()
                    .tenantId(req.getTenantId())
                    .programId(savedProgram.getId())
                    .type(OfferingType.COACHING_BATCH)
                    .name("Batch " + ((char) ('A' + i - 1))) // Batch A, Batch B...
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusYears(1))
                    .capacity(30)
                    .build();
            offeringsService.create(offering);
        }
    }
}
