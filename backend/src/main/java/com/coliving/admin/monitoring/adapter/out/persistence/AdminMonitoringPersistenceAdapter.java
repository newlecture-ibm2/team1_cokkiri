package com.coliving.admin.monitoring.adapter.out.persistence;

import com.coliving.admin.monitoring.application.port.out.AdminMonitoringRepositoryPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;

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
                WHERE d.deleted_at IS NULL AND d.is_active = true
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
}
