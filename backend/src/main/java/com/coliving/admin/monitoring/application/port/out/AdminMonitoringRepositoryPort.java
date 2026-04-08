package com.coliving.admin.monitoring.application.port.out;

import java.util.List;

public interface AdminMonitoringRepositoryPort {

    /** 기기 상태별 건수 조회 */
    List<Object[]> countDevicesByStatus();

    /** ERROR 기기 + 에러 로그 횟수 */
    List<Object[]> findDeviceErrorStats();

    /** 기기 종류별 제어 빈도 */
    List<Object[]> countControlByDeviceType();

    /** 일별 제어 빈도 (최근 30일) */
    List<Object[]> countDailyControl();
}
