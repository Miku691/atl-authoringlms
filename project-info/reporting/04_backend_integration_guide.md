# IMS Reports Service — Backend Integration Guide

> This document describes the complete Spring Boot backend architecture for
> `ims-reports-service`: from configuration, to data access, to report generation, to API contracts.

---

## 1. Service Configuration

### 1.1 Application Properties

```yaml
# application.yml
server:
  port: 8087

spring:
  application:
    name: ims-reports-service
  datasource:
    url: jdbc:mysql://localhost:3306/ims_reports_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_REPORTS_USER:rpt_user}
    password: ${DB_REPORTS_PASSWORD:rpt_pass}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate   # Reports DB is view-only, no schema generation
    show-sql: false

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

### 1.2 Project Structure

```
ims-reports-service/
├── src/
│   ├── main/
│   │   ├── java/com/ims/reports/
│   │   │   ├── ImsReportsServiceApplication.java
│   │   │   ├── config/
│   │   │   │   ├── ProjectConfig.java           # ModelMapper bean
│   │   │   │   ├── SecurityConfig.java          # JWT filter config
│   │   │   │   └── JasperConfig.java            # JasperReports beans
│   │   │   ├── controller/
│   │   │   │   ├── AttendanceReportController.java
│   │   │   │   ├── FinanceReportController.java
│   │   │   │   ├── StudentReportController.java
│   │   │   │   └── AcademicReportController.java
│   │   │   ├── service/
│   │   │   │   ├── AttendanceReportService.java
│   │   │   │   ├── FinanceReportService.java
│   │   │   │   ├── StudentReportService.java
│   │   │   │   └── AcademicReportService.java
│   │   │   ├── repository/
│   │   │   │   ├── AttendanceReportRepository.java   # JPA on views
│   │   │   │   ├── FinanceReportRepository.java
│   │   │   │   └── StudentReportRepository.java
│   │   │   ├── entity/                          # Immutable view entities
│   │   │   │   ├── VwStudentEnrollment.java
│   │   │   │   ├── VwAttendanceSummary.java
│   │   │   │   ├── VwFeeCollection.java
│   │   │   │   ├── VwFeeOutstanding.java
│   │   │   │   └── ...
│   │   │   ├── dto/
│   │   │   │   ├── AttendanceReportRequest.java
│   │   │   │   ├── FeeReportRequest.java
│   │   │   │   └── ...
│   │   │   ├── exception/
│   │   │   │   ├── ReportGenerationException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── security/
│   │   │   │   └── AuthenticationFromGatewayFilter.java
│   │   │   └── util/
│   │   │       ├── ApiResponse.java
│   │   │       ├── ApplicationConstant.java
│   │   │       └── ReportExportUtil.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── reports/                         # Jasper templates
│   │           ├── attendance_monthly.jrxml
│   │           ├── fee_collection.jrxml
│   │           ├── student_enrollment.jrxml
│   │           └── ...
│   └── test/
└── pom.xml
```

---

## 2. JPA View Entity Pattern

Since MySQL views are read-only, we map them as immutable JPA entities:

```java
@Entity
@Table(name = "vw_rpt_attendance_summary")
@Immutable  // hibernate annotation - skip dirty checking
@Getter
@NoArgsConstructor
public class VwAttendanceSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rowId;  // views need a unique column for JPA

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "offering_id")
    private String offeringId;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "year_month")
    private String yearMonth;

    @Column(name = "total_sessions")
    private Integer totalSessions;

    @Column(name = "present_count")
    private Integer presentCount;

    @Column(name = "absent_count")
    private Integer absentCount;

    @Column(name = "attendance_percentage")
    private Double attendancePercentage;
}
```

> **Note:** Because we use GROUP BY in summary views, we cannot use `@Id` on a natural column. We can use a `@GeneratedValue` trick or use `@EmbeddedId` for composite keys. For complex views, prefer native JDBC queries over JPA.

---

## 3. Report Repository Pattern

### Option A: JPA Repository (for simple views)

```java
@Repository
public interface AttendanceReportRepository extends JpaRepository<VwAttendanceSummary, Long> {

    List<VwAttendanceSummary> findByTenantIdAndOfferingIdAndYearMonth(
            String tenantId, String offeringId, String yearMonth);

    @Query("SELECT v FROM VwAttendanceSummary v WHERE v.tenantId = :tenantId " +
           "AND v.offeringId = :offeringId AND v.attendancePercentage < :threshold")
    List<VwAttendanceSummary> findDefaulters(
            @Param("tenantId") String tenantId,
            @Param("offeringId") String offeringId,
            @Param("threshold") double threshold);
}
```

### Option B: Native JDBC Template (for complex aggregations)

```java
@Repository
@RequiredArgsConstructor
public class FinanceReportRepositoryImpl {

    private final JdbcTemplate jdbcTemplate;

    public List<FeeOutstandingRow> getFeeOutstandingByOffering(
            String tenantId, String offeringId) {
        
        String sql = """
            SELECT student_id, fee_head_name, installment_number, due_date,
                   total_due, amount_paid, outstanding_amount, payment_status
            FROM vw_rpt_fee_outstanding
            WHERE tenant_id = ? AND offering_id = ?
            ORDER BY student_id, installment_number
            """;
        
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(FeeOutstandingRow.class),
                tenantId, offeringId);
    }
}
```

---

## 4. Report Service Pattern

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceReportService {

    private final AttendanceReportRepository attendanceRepo;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Generates monthly attendance report for a given offering and month.
     *
     * @param tenantId   tenant identifier from JWT
     * @param offeringId the offering (class/batch/semester)
     * @param yearMonth  format YYYY-MM
     * @param format     "pdf", "excel", or "csv"
     * @return byte array of the generated report
     */
    public byte[] generateMonthlyAttendance(
            String tenantId, String offeringId, String yearMonth, String format) {
        
        log.info("Generating monthly attendance report for tenant={}, offering={}, month={}",
                tenantId, offeringId, yearMonth);
        
        List<VwAttendanceSummary> data = attendanceRepo
                .findByTenantIdAndOfferingIdAndYearMonth(tenantId, offeringId, yearMonth);
        
        if (data.isEmpty()) {
            throw new ReportGenerationException("No attendance data found for the given criteria.");
        }
        
        return switch (format.toLowerCase()) {
            case "excel" -> generateAttendanceExcel(data, yearMonth);
            case "csv"   -> generateAttendanceCsv(data);
            default      -> generateAttendancePdf(data, tenantId, offeringId, yearMonth);
        };
    }
    
    private byte[] generateAttendancePdf(
            List<VwAttendanceSummary> data, String tenantId, String offeringId, String yearMonth) {
        try {
            InputStream template = getClass().getResourceAsStream("/reports/attendance_monthly.jrxml");
            JasperReport compiled = JasperCompileManager.compileReport(template);
            
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);
            Map<String, Object> params = new HashMap<>();
            params.put("tenantId", tenantId);
            params.put("offeringId", offeringId);
            params.put("reportMonth", yearMonth);
            
            JasperPrint print = JasperFillManager.fillReport(compiled, params, dataSource);
            return JasperExportManager.exportReportToPdf(print);
        } catch (Exception e) {
            log.error("Failed to generate PDF attendance report", e);
            throw new ReportGenerationException("PDF generation failed: " + e.getMessage());
        }
    }
    
    private byte[] generateAttendanceExcel(List<VwAttendanceSummary> data, String yearMonth) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance " + yearMonth);
            
            // Header row
            Row header = sheet.createRow(0);
            String[] headers = {"Student ID", "Total Sessions", "Present", "Absent", "Attendance %"};
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }
            
            // Data rows
            int rowNum = 1;
            for (VwAttendanceSummary row : data) {
                Row r = sheet.createRow(rowNum++);
                r.createCell(0).setCellValue(row.getStudentId());
                r.createCell(1).setCellValue(row.getTotalSessions());
                r.createCell(2).setCellValue(row.getPresentCount());
                r.createCell(3).setCellValue(row.getAbsentCount());
                r.createCell(4).setCellValue(row.getAttendancePercentage());
            }
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new ReportGenerationException("Excel generation failed: " + e.getMessage());
        }
    }
}
```

---

## 5. Controller Pattern

```java
@RestController
@RequestMapping("/ims-reports/attendance")
@RequiredArgsConstructor
@Slf4j
public class AttendanceReportController {

    private final AttendanceReportService attendanceReportService;

    /**
     * Generates monthly attendance summary report for an offering.
     *
     * @param offeringId offering identifier
     * @param yearMonth  report month in YYYY-MM format
     * @param format     output format: pdf (default), excel, csv
     * @param tenantId   injected by gateway from JWT
     * @return binary report file as attachment
     */
    @GetMapping("/monthly")
    public ResponseEntity<byte[]> getMonthlyAttendanceReport(
            @RequestParam String offeringId,
            @RequestParam String yearMonth,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestHeader("X-Tenant-Id") String tenantId) {

        byte[] report = attendanceReportService.generateMonthlyAttendance(
                tenantId, offeringId, yearMonth, format);

        return buildResponse(report, "attendance_monthly_" + yearMonth, format);
    }

    /**
     * Generates attendance defaulter list for students below threshold.
     *
     * @param offeringId  offering identifier
     * @param threshold   minimum attendance percentage (default 75)
     * @param format      output format
     * @param tenantId    injected by gateway
     * @return binary report file
     */
    @GetMapping("/defaulters")
    public ResponseEntity<byte[]> getAttendanceDefaulters(
            @RequestParam String offeringId,
            @RequestParam(defaultValue = "75.0") double threshold,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestHeader("X-Tenant-Id") String tenantId) {

        byte[] report = attendanceReportService.generateDefaulterReport(
                tenantId, offeringId, threshold, format);

        return buildResponse(report, "attendance_defaulters", format);
    }

    private ResponseEntity<byte[]> buildResponse(byte[] data, String filenameStem, String format) {
        String contentType = switch (format.toLowerCase()) {
            case "excel" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "csv"   -> "text/csv";
            default      -> "application/pdf";
        };
        String extension = switch (format.toLowerCase()) {
            case "excel" -> ".xlsx";
            case "csv"   -> ".csv";
            default      -> ".pdf";
        };
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filenameStem + extension + "\"")
                .body(data);
    }
}
```

---

## 6. API Endpoints Reference

### Attendance

| Method | Endpoint | Query Params | Description |
|--------|---------|-------------|-------------|
| GET | `/ims-reports/attendance/monthly` | `offeringId`, `yearMonth`, `format` | Monthly summary per student per offering |
| GET | `/ims-reports/attendance/defaulters` | `offeringId`, `threshold`, `format` | Students below attendance threshold |
| GET | `/ims-reports/attendance/daily` | `offeringId`, `date`, `format` | Day's attendance register |
| GET | `/ims-reports/attendance/student` | `studentId`, `offeringId`, `format` | Full attendance for one student |

### Finance

| Method | Endpoint | Query Params | Description |
|--------|---------|-------------|-------------|
| GET | `/ims-reports/finance/fee-collection` | `offeringId`, `from`, `to`, `format` | Fee collection in date range |
| GET | `/ims-reports/finance/fee-outstanding` | `offeringId`, `format` | Outstanding fees with status |
| GET | `/ims-reports/finance/fee-receipt` | `transactionId`, `format` | Single fee receipt PDF |
| GET | `/ims-reports/finance/expense-summary` | `yearMonth`, `format` | Expense by category |
| GET | `/ims-reports/finance/budget-vs-actual` | `academicYear`, `format` | Budget utilization report |
| GET | `/ims-reports/finance/income-statement` | `from`, `to`, `format` | Income statement |

### Student

| Method | Endpoint | Query Params | Description |
|--------|---------|-------------|-------------|
| GET | `/ims-reports/student/enrollment` | `sessionId`, `format` | Enrollment summary by session |
| GET | `/ims-reports/student/directory` | `offeringId`, `format` | Full student list |
| GET | `/ims-reports/student/guardian-contacts` | `offeringId`, `format` | Guardian contact list |

### Academic

| Method | Endpoint | Query Params | Description |
|--------|---------|-------------|-------------|
| GET | `/ims-reports/academic/offerings` | `sessionId`, `format` | Active offerings report |
| GET | `/ims-reports/academic/assignments` | `offeringId`, `assignmentId`, `format` | Assignment submission status |

---

## 7. Security / Gateway Integration

The `ims-reports-service` follows the same security contract as all other services:
- `X-Tenant-Id` header is injected by the gateway (never trusted from client)
- Reports are always filtered by `tenantId` — **tenant isolation is enforced at DB and service layer**
- JWT roles determine which reports a user can access (e.g., STUDENT cannot see financial reports)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, 
            AuthenticationFromGatewayFilter gatewayFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/ims-reports/finance/**").hasAnyRole("ADMIN", "FINANCE", "TENANT_ADMIN")
                .requestMatchers("/ims-reports/attendance/**").hasAnyRole("ADMIN", "TEACHER", "TENANT_ADMIN")
                .requestMatchers("/ims-reports/student/**").hasAnyRole("ADMIN", "TENANT_ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(gatewayFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

## 8. Exception Handling

```java
public class ReportGenerationException extends RuntimeException {
    public ReportGenerationException(String message) {
        super(message);
    }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ReportGenerationException.class)
    public ResponseEntity<ApiResponse<Void>> handleReportError(ReportGenerationException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
}
```
