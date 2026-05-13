package com.ims.student.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE ims_students DROP CONSTRAINT IF EXISTS uk8m0yw7ax5eb2084fjw6swn3aa");
            jdbcTemplate.execute("ALTER TABLE ims_students DROP CONSTRAINT IF EXISTS uk_admission_no");
            System.out.println("Dropped old unique constraints on admission_no successfully.");
        } catch (Exception e) {
            System.out.println("Failed to drop unique constraints (they might not exist or were already dropped): " + e.getMessage());
        }
    }
}
