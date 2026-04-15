package com.coliving.global.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Hibernate ddl-auto=update가 처리하지 못하는 스키마 마이그레이션을 담당합니다.
 *
 * <p>DataInitializer(@Order(100))보다 먼저 실행되며,
 * Profile 조건 없이 항상 실행됩니다.</p>
 *
 * <p>모든 SQL은 IF EXISTS / IF NOT EXISTS로 idempotent하게 작성합니다.</p>
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class SchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        migrateDeviceTypesCodeConstraint();
    }

    /**
     * device_types.code 컬럼의 전체 Unique 제약을 Partial Unique Index로 교체.
     *
     * <p>Soft Delete 후 동일 code로 재등록할 수 있도록,
     * 활성 레코드(deleted_at IS NULL)에서만 중복을 방지합니다.</p>
     */
    private void migrateDeviceTypesCodeConstraint() {
        try {
            // 기존 code 컬럼의 모든 Unique 제약을 동적으로 찾아 삭제
            var constraints = jdbcTemplate.queryForList(
                    "SELECT tc.constraint_name " +
                    "FROM information_schema.table_constraints tc " +
                    "JOIN information_schema.constraint_column_usage ccu " +
                    "  ON tc.constraint_name = ccu.constraint_name " +
                    "WHERE tc.table_name = 'device_types' " +
                    "  AND tc.constraint_type = 'UNIQUE' " +
                    "  AND ccu.column_name = 'code'",
                    String.class
            );

            for (String constraintName : constraints) {
                jdbcTemplate.execute(
                        "ALTER TABLE device_types DROP CONSTRAINT IF EXISTS " + constraintName
                );
                log.info("[스키마 마이그레이션] device_types Unique 제약 삭제: {}", constraintName);
            }

            // Partial Unique Index 생성 (활성 레코드만)
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS uk_device_types_code_active " +
                    "ON device_types (code) WHERE deleted_at IS NULL"
            );

            log.info("[스키마 마이그레이션] device_types.code Partial Unique Index 적용 완료");
        } catch (Exception e) {
            log.warn("[스키마 마이그레이션] device_types.code 제약 교체 실패 — {}", e.getMessage());
        }
    }
}
