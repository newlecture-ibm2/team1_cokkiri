package com.coliving.infra.iot;

import com.coliving.admin.device.adapter.out.jpa.DeviceEntity;
import com.coliving.admin.device.adapter.out.jpa.DeviceJpaRepository;
import com.coliving.admin.device.model.DeviceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * IoT 기기 상태 헬스체크 스케줄러
 *
 * 주기적으로 Mock IoT 서버에서 전체 기기 상태를 조회하여
 * 백엔드 DB의 기기 status를 동기화합니다.
 *
 * <h3>역할</h3>
 * <ul>
 *   <li>ERROR → ONLINE 복구 감지 (IoT 기기가 자체 복구된 경우)</li>
 *   <li>ONLINE → ERROR 장애 감지 (IoT 에러 시뮬레이션에 의한 장애)</li>
 * </ul>
 *
 * <h3>주기</h3>
 * 30초마다 실행. 기기 수가 적은 데모 환경에서 부하 무시 가능.
 *
 * @see MockIotClient#discoverDevices()
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IotDeviceHealthCheckScheduler {

    private final IotClient iotClient;
    private final DeviceJpaRepository deviceJpaRepository;

    /**
     * Mock IoT 서버의 기기 상태를 조회하여 DB와 동기화
     * - MAC 주소 기준으로 매칭
     * - 상태가 변경된 기기만 UPDATE (jpaRepository.save 명시 호출 — §5)
     */
    @Scheduled(fixedDelay = 30_000, initialDelay = 60_000)
    @Transactional
    public void syncDeviceStatus() {
        List<IotDeviceInfo> iotDevices;
        try {
            iotDevices = iotClient.discoverDevices();
        } catch (Exception e) {
            log.warn("[IoT 헬스체크] Mock IoT 서버 통신 실패 — {}", e.getMessage());
            return;
        }

        if (iotDevices.isEmpty()) {
            return;
        }

        // IoT 기기 상태를 MAC 주소 기준 Map으로 구성
        Map<String, String> iotStatusMap = iotDevices.stream()
                .filter(d -> d.macAddress() != null && d.status() != null)
                .collect(Collectors.toMap(
                        IotDeviceInfo::macAddress,
                        IotDeviceInfo::status,
                        (a, b) -> b // 중복 시 마지막 값
                ));

        // DB의 활성 기기 목록 조회
        List<DeviceEntity> dbDevices = deviceJpaRepository.findAll();
        int recoveredCount = 0;
        int errorCount = 0;

        for (DeviceEntity device : dbDevices) {
            if (device.getMacAddress() == null) continue;

            String iotStatus = iotStatusMap.get(device.getMacAddress());
            if (iotStatus == null) continue;

            DeviceStatus currentDbStatus = device.getStatus();
            DeviceStatus newStatus = parseStatus(iotStatus);
            if (newStatus == null || currentDbStatus == newStatus) continue;

            // 상태 변경 감지
            device.updateStatus(newStatus);
            deviceJpaRepository.save(device);

            if (currentDbStatus == DeviceStatus.ERROR && newStatus == DeviceStatus.ONLINE) {
                recoveredCount++;
                log.info("[IoT 헬스체크] 기기 복구 감지: {} (mac: {}) — ERROR → ONLINE",
                        device.getName(), device.getMacAddress());
            } else if (currentDbStatus == DeviceStatus.ONLINE && newStatus == DeviceStatus.ERROR) {
                errorCount++;
                log.warn("[IoT 헬스체크] 기기 장애 감지: {} (mac: {}) — ONLINE → ERROR",
                        device.getName(), device.getMacAddress());
            } else {
                log.info("[IoT 헬스체크] 기기 상태 변경: {} (mac: {}) — {} → {}",
                        device.getName(), device.getMacAddress(), currentDbStatus, newStatus);
            }
        }

        if (recoveredCount > 0 || errorCount > 0) {
            log.info("[IoT 헬스체크] 동기화 완료 — 복구: {}건, 장애: {}건", recoveredCount, errorCount);
        }
    }

    private DeviceStatus parseStatus(String status) {
        try {
            return DeviceStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
