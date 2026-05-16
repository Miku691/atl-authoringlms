package com.ims.finance.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE fee_structures ALTER COLUMN offering_id DROP NOT NULL;");
            System.out.println("Successfully altered offering_id to drop NOT NULL constraint.");
        } catch (Exception e) {
            System.err.println("Error altering table fee_structures: " + e.getMessage());
        }
    }
}
