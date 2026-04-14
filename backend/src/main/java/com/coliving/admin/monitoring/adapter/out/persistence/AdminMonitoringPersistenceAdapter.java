package com.coliving.admin.monitoring.adapter.out.persistence;

import com.coliving.admin.monitoring.application.command.AdminControlLogListCommand;
import com.coliving.admin.monitoring.application.port.out.AdminMonitoringRepositoryPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@SuppressWarnings("unchecked")
public class AdminMonitoringPersistenceAdapter implements AdminMonitoringRepositoryPort {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<Object[]> countDevicesByStatus() {
        return em.createNativeQuery("""
                SELECT d.status, COUNT(*)
                FROM devices d
                WHERE d.deleted_at IS NULL
                GROUP BY d.status
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> findDeviceErrorStats() {
        return em.createNativeQuery("""
                SELECT d.device_id, d.name, dt.code, dt.name,
                       s.name AS space_name, d.status,
                       COUNT(cl.control_log_id) AS error_count,
                       d.last_online_at
                FROM devices d
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                JOIN spaces s ON d.space_id = s.space_id
                LEFT JOIN control_logs cl ON d.device_id = cl.device_id
                    AND cl.result = 'FAILURE' AND cl.deleted_at IS NULL
                WHERE d.deleted_at IS NULL
                  AND (d.status = 'ERROR' OR EXISTS (
                      SELECT 1 FROM control_logs cl2
                      WHERE cl2.device_id = d.device_id
                        AND cl2.result = 'FAILURE'
                        AND cl2.deleted_at IS NULL
                  ))
                GROUP BY d.device_id, d.name, dt.code, dt.name,
                         s.name, d.status, d.last_online_at
                ORDER BY error_count DESC
                LIMIT 20
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> countControlByDeviceType() {
        return em.createNativeQuery("""
                SELECT dt.name, COUNT(cl.control_log_id)
                FROM control_logs cl
                JOIN devices d ON cl.device_id = d.device_id
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                WHERE cl.deleted_at IS NULL AND d.deleted_at IS NULL
                GROUP BY dt.device_type_id, dt.name
                ORDER BY COUNT(cl.control_log_id) DESC
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> countDailyControl() {
        return em.createNativeQuery("""
                SELECT DATE(cl.created_at) AS control_date, COUNT(*)
                FROM control_logs cl
                WHERE cl.deleted_at IS NULL
                  AND cl.created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(cl.created_at)
                ORDER BY control_date
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> findControlLogs(AdminControlLogListCommand command) {
        StringBuilder sql = new StringBuilder("""
                SELECT cl.control_log_id, cl.device_id, d.name AS device_name,
                       dt.name AS device_type_name, s.name AS space_name,
                       cl.user_id, u.name AS user_name,
                       cl.actor_type, cl.command, cl.command_params,
                       cl.result, cl.error_message, cl.correlation_id, cl.created_at,
                       dt.commands AS device_type_commands
                FROM control_logs cl
                JOIN devices d ON cl.device_id = d.device_id
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                JOIN spaces s ON d.space_id = s.space_id
                LEFT JOIN users u ON cl.user_id = u.user_id
                WHERE cl.deleted_at IS NULL
                """);

        appendFilters(sql, command);
        sql.append(" ORDER BY cl.created_at DESC");
        sql.append(" LIMIT :limit OFFSET :offset");

        Query query = em.createNativeQuery(sql.toString());
        bindFilterParams(query, command);
        query.setParameter("limit", command.size());
        query.setParameter("offset", command.page() * command.size());

        return query.getResultList();
    }

    @Override
    public long countControlLogs(AdminControlLogListCommand command) {
        StringBuilder sql = new StringBuilder("""
                SELECT COUNT(*)
                FROM control_logs cl
                JOIN devices d ON cl.device_id = d.device_id
                WHERE cl.deleted_at IS NULL
                """);

        appendFilters(sql, command);

        Query query = em.createNativeQuery(sql.toString());
        bindFilterParams(query, command);

        return ((Number) query.getSingleResult()).longValue();
    }

    // ── 동적 필터 공통 메서드 ──

    private void appendFilters(StringBuilder sql, AdminControlLogListCommand command) {
        if (command.deviceId() != null) {
            sql.append(" AND cl.device_id = :deviceId");
        }
        if (command.userId() != null) {
            sql.append(" AND cl.user_id = :userId");
        }
        if (command.spaceId() != null) {
            sql.append(" AND d.space_id = :spaceId");
        }
        if (command.deviceTypeId() != null) {
            sql.append(" AND d.device_type_id = :deviceTypeId");
        }
        if (command.result() != null) {
            sql.append(" AND cl.result = :result");
        }
        if (command.startDate() != null) {
            sql.append(" AND cl.created_at >= :startDate");
        }
        if (command.endDate() != null) {
            sql.append(" AND cl.created_at < :endDate");
        }
    }

    private void bindFilterParams(Query query, AdminControlLogListCommand command) {
        if (command.deviceId() != null) {
            query.setParameter("deviceId", command.deviceId());
        }
        if (command.userId() != null) {
            query.setParameter("userId", command.userId());
        }
        if (command.spaceId() != null) {
            query.setParameter("spaceId", command.spaceId());
        }
        if (command.deviceTypeId() != null) {
            query.setParameter("deviceTypeId", command.deviceTypeId());
        }
        if (command.result() != null) {
            query.setParameter("result", command.result());
        }
        if (command.startDate() != null) {
            query.setParameter("startDate", command.startDate().atStartOfDay());
        }
        if (command.endDate() != null) {
            // endDate 다음날 00:00까지 포함 (exclusive)
            query.setParameter("endDate", command.endDate().plusDays(1).atStartOfDay());
        }
    }

    // ── 추가 통계 쿼리 ──

    @Override
    public List<Object[]> countControlBySpaceType() {
        return em.createNativeQuery("""
                SELECT s.type, COUNT(cl.control_log_id)
                FROM control_logs cl
                JOIN devices d ON cl.device_id = d.device_id
                JOIN spaces s ON d.space_id = s.space_id
                WHERE cl.deleted_at IS NULL AND d.deleted_at IS NULL AND s.deleted_at IS NULL
                GROUP BY s.type
                ORDER BY COUNT(cl.control_log_id) DESC
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> countControlByCommand() {
        return em.createNativeQuery("""
                SELECT cl.command, COUNT(cl.control_log_id)
                FROM control_logs cl
                WHERE cl.deleted_at IS NULL
                GROUP BY cl.command
                ORDER BY COUNT(cl.control_log_id) DESC
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> countControlByDeviceTypeAndCommand() {
        return em.createNativeQuery("""
                SELECT dt.name, cl.command, COUNT(cl.control_log_id)
                FROM control_logs cl
                JOIN devices d ON cl.device_id = d.device_id
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                WHERE cl.deleted_at IS NULL AND d.deleted_at IS NULL
                GROUP BY dt.name, cl.command
                ORDER BY dt.name, COUNT(cl.control_log_id) DESC
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> countDailyErrors() {
        return em.createNativeQuery("""
                SELECT DATE(cl.created_at) AS error_date, COUNT(*)
                FROM control_logs cl
                WHERE cl.deleted_at IS NULL
                  AND cl.result = 'FAILURE'
                  AND cl.created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(cl.created_at)
                ORDER BY error_date
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> findDeviceStatusBySpace() {
        return em.createNativeQuery("""
                SELECT s.name, s.type, dt.name, d.status, COUNT(*)
                FROM devices d
                JOIN spaces s ON d.space_id = s.space_id
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                WHERE d.deleted_at IS NULL AND s.deleted_at IS NULL
                GROUP BY s.name, s.type, dt.name, d.status
                ORDER BY s.type, s.name, dt.name, d.status
                """)
                .getResultList();
    }

    @Override
    public List<Object[]> countDeviceAvailability() {
        return em.createNativeQuery("""
                SELECT d.device_id, d.name, dt.name AS device_type_name, s.name AS space_name,
                       s.floor,
                       COUNT(cl.control_log_id) AS total_count,
                       COUNT(CASE WHEN cl.result = 'SUCCESS' THEN 1 END) AS success_count,
                       COUNT(CASE WHEN cl.result = 'FAILURE' THEN 1 END) AS failure_count
                FROM devices d
                JOIN device_types dt ON d.device_type_id = dt.device_type_id
                JOIN spaces s ON d.space_id = s.space_id
                LEFT JOIN control_logs cl ON d.device_id = cl.device_id
                    AND cl.deleted_at IS NULL
                    AND cl.created_at >= CURRENT_DATE - INTERVAL '30 days'
                WHERE d.deleted_at IS NULL AND s.deleted_at IS NULL
                GROUP BY d.device_id, d.name, dt.name, s.name, s.floor
                HAVING COUNT(cl.control_log_id) > 0
                ORDER BY total_count DESC
                LIMIT 20
                """)
                .getResultList();
    }
}

