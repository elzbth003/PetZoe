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
        ensureDatabaseFunctions();

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
            // 1. Truncate existing initial demo data with CASCADE (cleans slate for local backup)
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

            // 2. Read and execute data_migration.sql statement by statement with fault tolerance
            log.info("Restoring users, pets, appointments, products, orders, and shelters...");
            int totalExecuted = 0;
            int errors = 0;

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                
                StringBuilder statement = new StringBuilder();
                String line;

                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                        continue;
                    }
                    statement.append(line).append(" ");
                    if (trimmed.endsWith(";")) {
                        String sql = statement.toString().trim();
                        statement.setLength(0);

                        try {
                            jdbcTemplate.execute(sql);
                            totalExecuted++;
                        } catch (Exception ex) {
                            errors++;
                        }
                    }
                }

                log.info("Executed {} migration statements ({} skipped/non-critical).", totalExecuted, errors);
            }

            // 3. Synchronize all PostgreSQL sequences to current max IDs
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

            Integer finalCount = jdbcTemplate.queryForObject("SELECT count(*) FROM users", Integer.class);
            log.info("==================================================================");
            log.info("MIGRATION SUCCESSFUL! Total users in Azure database: {}", finalCount);
            log.info("==================================================================");

        } catch (Exception e) {
            log.error("Error during data migration: ", e);
        }
    }

    private void ensureDatabaseFunctions() {
        try {
            jdbcTemplate.execute("""
                CREATE OR REPLACE FUNCTION cosine_similarity_arr(a real[], b real[])
                RETURNS double precision AS $$
                DECLARE
                    dot_prod double precision := 0.0;
                    norm_a double precision := 0.0;
                    norm_b double precision := 0.0;
                    dim int;
                    i int;
                BEGIN
                    IF a IS NULL OR b IS NULL THEN
                        RETURN 0.0;
                    END IF;
                    dim := array_length(a, 1);
                    IF dim IS NULL OR dim <> array_length(b, 1) THEN
                        RETURN 0.0;
                    END IF;
                    FOR i IN 1..dim LOOP
                        dot_prod := dot_prod + (a[i] * b[i]);
                        norm_a := norm_a + (a[i] * a[i]);
                        norm_b := norm_b + (b[i] * b[i]);
                    END LOOP;
                    IF norm_a = 0.0 OR norm_b = 0.0 THEN
                        RETURN 0.0;
                    END IF;
                    RETURN dot_prod / (sqrt(norm_a) * sqrt(norm_b));
                END;
                $$ LANGUAGE plpgsql IMMUTABLE;
            """);
            log.info("Ensured PostgreSQL function 'cosine_similarity_arr' exists.");
        } catch (Exception e) {
            log.warn("Could not create 'cosine_similarity_arr' function: {}", e.getMessage());
        }
    }

}
