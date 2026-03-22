package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsClassesDto;
import com.ims.academic.dto.ImsOfferingsDto;
import com.ims.academic.dto.ImsProgramsDto;
import com.ims.academic.dto.ImsSectionsDto;
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
import com.ims.academic.service.ImsSectionsService;
import com.ims.academic.repo.ImsSubjectsRepo;
import com.ims.academic.repo.GradingScaleRepo;
import com.ims.academic.repo.DepartmentRepo;
import com.ims.academic.entity.ImsSubjects;
import com.ims.academic.entity.GradingScale;
import com.ims.academic.entity.Department;
import com.ims.academic.enums.SubjectType;
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
    private final ImsSectionsService sectionsService;
    private final ImsProgramsRepo programsRepo;
    private final ImsOfferingsRepo offeringsRepo;
    private final ImsSubjectsRepo subjectsRepo;
    private final GradingScaleRepo gradingScaleRepo;
    private final DepartmentRepo departmentRepo;
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

    @Override
    @Transactional
    public void bootstrapSubjects(String tenantId) {
        String[][] defaultSubjects = {
            {"MATH", "Mathematics"}, {"SCI", "Science"}, {"ENG", "English"},
            {"PHY", "Physics"}, {"CHE", "Chemistry"}, {"BIO", "Biology"},
            {"HIS", "History"}, {"GEO", "Geography"}, {"CS", "Computer Science"},
            {"PE", "Physical Education"}
        };

        for (String[] sub : defaultSubjects) {
            if (!subjectsRepo.existsByTenantIdAndCode(tenantId, sub[0])) {
                ImsSubjects subject = ImsSubjects.builder()
                        .tenantId(tenantId)
                        .code(sub[0])
                        .title(sub[1])
                        .subjectType(SubjectType.THEORY)
                        .build();
                subjectsRepo.save(subject);
            }
        }
    }

    @Override
    @Transactional
    public void bootstrapGradingScales(String tenantId) {
        Object[][] defaultScales = {
            {"A+", 90.0, 100.0, 4.0, "Excellent"},
            {"A", 80.0, 89.9, 3.7, "Very Good"},
            {"B+", 70.0, 79.9, 3.3, "Good"},
            {"B", 60.0, 69.9, 3.0, "Above Average"},
            {"C", 50.0, 59.9, 2.0, "Average"},
            {"D", 40.0, 49.9, 1.0, "Pass"},
            {"F", 0.0, 39.9, 0.0, "Fail"}
        };

        for (Object[] scale : defaultScales) {
            if (!gradingScaleRepo.existsByTenantIdAndGradeLabel(tenantId, (String) scale[0])) {
                GradingScale gs = GradingScale.builder()
                        .tenantId(tenantId)
                        .gradeLabel((String) scale[0])
                        .minPercentage((Double) scale[1])
                        .maxPercentage((Double) scale[2])
                        .gradePoint((Double) scale[3])
                        .description((String) scale[4])
                        .build();
                gradingScaleRepo.save(gs);
            }
        }
    }

    @Override
    @Transactional
    public void bootstrapDepartments(String tenantId) {
        String[][] defaultDepts = {
            {"ACAD", "Academics"}, {"ADMIN", "Administration"},
            {"SPORTS", "Sports"}, {"SCI", "Science"}, {"HUM", "Humanities"}
        };

        for (String[] dept : defaultDepts) {
            if (!departmentRepo.existsByTenantIdAndName(tenantId, dept[1])) {
                Department d = Department.builder()
                        .tenantId(tenantId)
                        .code(dept[0])
                        .name(dept[1])
                        .build();
                departmentRepo.save(d);
            }
        }
    }

    @Override
    public java.util.Map<String, Boolean> getBulkSetupStatus(String tenantId) {
        java.util.Map<String, Boolean> status = new java.util.HashMap<>();
        status.put("subjects", !subjectsRepo.findByTenantId(tenantId).isEmpty());
        status.put("grading", !gradingScaleRepo.findByTenantId(tenantId).isEmpty());
        status.put("departments", !departmentRepo.findByTenantId(tenantId).isEmpty());
        return status;
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
        sessionService.create(session);

        // 2. Create Classes and Sections
        int start = config.getStartClass() > 0 ? config.getStartClass() : 1;
        int end = config.getEndClass() > 0 ? config.getEndClass() : 12;
        int sections = config.getSectionsPerClass() > 0 ? config.getSectionsPerClass() : 1;

        for (int i = start; i <= end; i++) {
            // 2.1 Create Class (e.g., "Class 1")
            String baseClassName = "Class " + i;
            ImsClassesDto classDto = ImsClassesDto.builder()
                    .tenantId(req.getTenantId())
                    .name(baseClassName)
                    .code("CLS-" + i)
                    .capacity(40) // Default for sections created by this class
                    .build();
            ImsClassesDto savedClass = classesService.create(classDto);

            for (int s = 0; s < sections; s++) {
                String sectionLabel = String.valueOf((char) ('A' + s));

                // 2.2 Create Section Entity (Orchestration happens inside sectionsService)
                ImsSectionsDto sectionDto = ImsSectionsDto.builder()
                        .tenantId(req.getTenantId())
                        .classId(savedClass.getId())
                        .name(sectionLabel)
                        .capacity(40)
                        .programId(savedProgram.getId())
                        .build();
                sectionsService.create(sectionDto);
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
