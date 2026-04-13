package com.coliving.infra.iot;

/**
 * IoT 게이트웨이 정보 DTO
 * <p>
 * 각 게이트웨이(host)에 연결된 기기 수와 상태 요약을 포함합니다.
 * 관리자가 네트워크 토폴로지를 파악하고 게이트웨이별로 기기를 탐색할 때 사용합니다.
 */
public record IotGatewayInfo(
    String host,
    int deviceCount,
    int onlineCount,
    int errorCount
) {}
