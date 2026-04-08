package com.coliving.admin.monitoring.application.port.out;

import com.coliving.admin.monitoring.application.command.AdminControlLogListCommand;

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

    /** 관리자 제어 이력 목록 (페이징) */
    List<Object[]> findControlLogs(AdminControlLogListCommand command);

    /** 관리자 제어 이력 전체 건수 */
    long countControlLogs(AdminControlLogListCommand command);
}
