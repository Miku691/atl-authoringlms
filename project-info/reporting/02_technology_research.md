# Spring Boot Reporting Technology Research

> Research on best-fit reporting libraries for the IMS Reports Service.  
> This is an in-depth analysis of Java/Spring Boot reporting tools, their trade-offs, and our recommendation.

---

## 1. Libraries Evaluated

| Library | Primary Purpose | License | Spring Boot Integration |
|---------|----------------|---------|------------------------|
| **JasperReports** | Full reporting engine (PDF, Excel, HTML, CSV) | LGPL (Community) | Via `jasperreports` dependency + REST endpoint |
| **Apache POI** | Excel (XLSX/XLS) generation & reading | Apache 2.0 | Manual, no starter needed |
| **OpenPDF** | PDF generation (fork of iText 4.x) | LGPL / MPL | Manual, no starter needed |
| **iText 9** | Advanced PDF generation | AGPL (commercial for closed-source) | Manual, no starter needed |
| **Flying Saucer (XHTML2PDF)** | HTML-to-PDF rendering | LGPL | Manual |

---

## 2. Deep Dive: JasperReports

### What It Is
JasperReports is the most mature and comprehensive open-source reporting engine in the Java world. It has been around since 2001, used by enterprise products like ERPs, banking software, and telecom systems.

### How It Works
1. You design a report template (`.jrxml` file) using **Jaspersoft Studio** (a free Eclipse plugin)
2. The template is compiled into `.jasper` binary
3. At runtime, JasperReports fills the template with a **data source** (JDBC, list of POJOs, JSON, etc.)
4. The filled report is exported to PDF, Excel, HTML, CSV, etc.

### Spring Boot Integration
```xml
<!-- In pom.xml -->
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>7.0.1</version>
</dependency>
<!-- For Excel export -->
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports-excel-common</artifactId>
    <version>7.0.1</version>
</dependency>
<!-- For PDF export (uses OpenPDF internally) -->
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId name="openpdf">openpdf</artifactId>
    <version>2.0.3</version>
</dependency>
```

### JasperReports in Spring Boot (Pattern)
```java
// Service method example
public byte[] generateAttendanceReport(String tenantId, String offeringId) {
    InputStream template = getClass().getResourceAsStream("/reports/attendance_report.jrxml");
    JasperReport compiled = JasperCompileManager.compileReport(template);
    
    Map<String, Object> params = new HashMap<>();
    params.put("tenantId", tenantId);
    params.put("offeringId", offeringId);
    
    // Use JDBC connection directly to the reporting DB/view
    JasperPrint print = JasperFillManager.fillReport(compiled, params, jdbcConnection);
    
    return JasperExportManager.exportReportToPdf(print);  // or Excel
}
```

### Strengths for IMS
- **Multi-format output** from the same template: PDF, XLSX, CSV, HTML
- **Visual designer** — no hardcoded layout in Java code
- **Subreports** — a single PDF can embed multiple report sections
- **Charts, images, QR codes** — built-in support
- **JDBC integration** — works directly with our MySQL views
- **Parameterized reports** — tenantId, dateRange, offeringId as parameters

### Weaknesses
- Learning curve for Jaspersoft Studio (moderate)
- Template files (.jrxml/.jasper) need to be bundled in resources
- Slightly heavier startup vs programmatic libs

---

## 3. Deep Dive: Apache POI

### What It Is
The standard for Excel generation in Java. If you need XLSX, this is the go-to.

### Spring Boot Integration
```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.3.0</version>
</dependency>
```

### Pattern
```java
public byte[] generateFeeCollectionExcel(List<FeeCollectionRow> data) {
    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Fee Collection");
    // ... populate rows and cells programmatically
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    workbook.write(out);
    return out.toByteArray();
}
```

### Use in IMS
- Best for **bulk data exports** where the user needs to work with the data in Excel
- Attendance registers, student lists, fee records, financial exports
- Use `SXSSFWorkbook` for large datasets (streaming mode)

---

## 4. Deep Dive: OpenPDF

### What It Is
A free (LGPL) fork of iText 4.2, actively maintained. The best choice for **programmatic PDF** without a template engine.

### Spring Boot Integration
```xml
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>2.0.3</version>
</dependency>
```

### Use in IMS
- Best for **document-style PDFs**: fee receipts, certificates, demand notes
- When you need custom branding/letterhead without a visual designer
- Often used alongside JasperReports (JasperReports uses it internally for PDF)

---

## 5. Recommendation for IMS

### ✅ Primary Stack: JasperReports + Apache POI + OpenPDF

**Rationale:**

| Need | Solution |
|------|---------|
| Complex formatted PDFs (report cards, registers) | JasperReports + JRXML templates |
| Bulk Excel exports (rosters, financial data) | Apache POI |
| Document-style PDFs (receipts, certificates) | OpenPDF (or JasperReports for consistency) |
| CSV export | JasperReports built-in or manual String building |

**Why NOT iText 9?**
- AGPL license means our IMS (proprietary/commercial) would need a paid commercial license.
- OpenPDF gives equivalent capability under LGPL for free.

**Why JasperReports over Flying Saucer?**
- Flying Saucer converts HTML→PDF but lacks template designer, charts, subreports.
- JasperReports is more feature-complete and enterprise-proven.

---

## 6. Key Maven Dependencies Final List

```xml
<!-- JasperReports Core -->
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>7.0.1</version>
</dependency>

<!-- JasperReports Excel Export -->
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports-excel-common</artifactId>
    <version>7.0.1</version>
</dependency>

<!-- OpenPDF (for JasperReports PDF + standalone use) -->
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>2.0.3</version>
</dependency>

<!-- Apache POI for bulk Excel -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.3.0</version>
</dependency>

<!-- Spring Boot JPA (for reporting DB access) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL Connector -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Cloud (Eureka Discovery) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

---

## 7. Report Generation Flow (Technical)

```
Request from Frontend
        |
        v
Gateway (validates JWT, injects tenantId)
        |
        v
ims-reports-service
        |
        v
Repository Layer (JDBC or JPA)
  → Queries a MySQL VIEW in ims_reports_db
        |
        v
JasperReports Engine
  → Loads .jasper template from classpath
  → Fills with data + parameters
        |
        v
Export Manager
  → PDF  → byte[]
  → XLSX → byte[]
  → CSV  → byte[]
        |
        v
Controller returns ResponseEntity<byte[]>
  with Content-Disposition: attachment
```

---

## 8. Template Management Strategy

| Option | Description | Recommendation |
|--------|-------------|---------------|
| **Classpath Templates** | Store .jasper files in `src/main/resources/reports/` | ✅ Best for most reports |
| **DB-stored Templates** | Templates stored in database | ❌ Too complex for now |
| **Pre-compiled .jasper** | Compile once, ship with build | ✅ Improves startup performance |

**Our approach:** Pre-compile `.jrxml` → `.jasper` using Maven plugin (jasperreports-maven-plugin) during build. Compiled `.jasper` files live in `resources/reports/`.

---

## 9. Controller Response Pattern

```java
@GetMapping("/attendance/monthly")
public ResponseEntity<byte[]> getMonthlyAttendance(
        @RequestParam String offeringId,
        @RequestParam String month,
        @RequestParam(defaultValue = "pdf") String format,
        @RequestHeader("X-Tenant-Id") String tenantId) {
    
    byte[] reportBytes = reportService.generateMonthlyAttendance(tenantId, offeringId, month, format);
    
    String contentType = switch (format.toLowerCase()) {
        case "excel" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "csv"   -> "text/csv";
        default      -> "application/pdf";
    };
    
    String filename = switch (format.toLowerCase()) {
        case "excel" -> "attendance_report.xlsx";
        case "csv"   -> "attendance_report.csv";
        default      -> "attendance_report.pdf";
    };
    
    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .body(reportBytes);
}
```
