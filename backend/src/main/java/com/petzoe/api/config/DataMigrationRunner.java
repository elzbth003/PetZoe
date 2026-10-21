package com.petzoe.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Automatically restores the complete pre-hosting local database snapshot (89 users,
 * 41 pets, 224 appointments, 51 products, 26 orders, shelters, etc.) to the Azure
 * PostgreSQL Flexible Server.
 */
@Component
@Order(1)
public class DataMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataMigrationRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public DataMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            Integer userCount = jdbcTemplate.queryForObject("SELECT count(*) FROM users", Integer.class);
            if (userCount != null && userCount >= 20) {
                log.info("Database already contains {} users. Full migration already present. Skipping.", userCount);
                return;
            }
        } catch (Exception e) {
            log.warn("Could not query user count prior to migration: {}", e.getMessage());
        }

        ClassPathResource resource = new ClassPathResource("data_migration.sql");
        if (!resource.exists()) {
            log.info("No data_migration.sql found. Skipping migration.");
            return;
        }

        log.info("==================================================================");
        log.info("Starting local database migration to Azure PostgreSQL database...");
        log.info("==================================================================");

        try {
            // 1. Temporarily disable foreign key constraint enforcement during session import
            jdbcTemplate.execute("SET session_replication_role = 'replica'");

            // 2. Truncate existing initial demo data with CASCADE
            log.info("Clearing existing initial dummy rows from public tables...");
            jdbcTemplate.execute("""
                DO $$ 
                DECLARE 
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            """);

            // 3. Read and execute data_migration.sql in batches
            log.info("Restoring users, pets, appointments, products, orders, and shelters...");
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                
                StringBuilder statement = new StringBuilder();
                String line;
                List<String> batch = new ArrayList<>();
                int totalExecuted = 0;

                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                        continue;
                    }
                    statement.append(line).append(" ");
                    if (trimmed.endsWith(";")) {
                        String sql = statement.toString().trim();
                        batch.add(sql);
                        statement.setLength(0);

                        if (batch.size() >= 50) {
                            jdbcTemplate.batchUpdate(batch.toArray(new String[0]));
                            totalExecuted += batch.size();
                            batch.clear();
                        }
                    }
                }

                if (!batch.isEmpty()) {
                    jdbcTemplate.batchUpdate(batch.toArray(new String[0]));
                    totalExecuted += batch.size();
                }

                log.info("Successfully executed {} migration statements.", totalExecuted);
            }

            // 4. Synchronize all PostgreSQL sequences to current max IDs
            log.info("Synchronizing PostgreSQL sequences to prevent ID collisions...");
            jdbcTemplate.execute("""
                DO $$
                DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (
                        SELECT table_name, column_name 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                          AND column_default LIKE 'nextval%'
                    ) LOOP
                        EXECUTE format('SELECT setval(pg_get_serial_sequence(''%I'', ''%I''), COALESCE(MAX(%I), 1)) FROM %I', r.table_name, r.column_name, r.column_name, r.table_name);
                    END LOOP;
                END $$;
            """);

            // 5. Re-enable foreign key constraints
            jdbcTemplate.execute("SET session_replication_role = 'origin'");

            Integer finalCount = jdbcTemplate.queryForObject("SELECT count(*) FROM users", Integer.class);
            log.info("==================================================================");
            log.info("MIGRATION SUCCESSFUL! Total users in Azure database: {}", finalCount);
            log.info("==================================================================");

        } catch (Exception e) {
            log.error("Error during data migration: ", e);
            try {
                jdbcTemplate.execute("SET session_replication_role = 'origin'");
            } catch (Exception ignored) {}
        }
    }
}
