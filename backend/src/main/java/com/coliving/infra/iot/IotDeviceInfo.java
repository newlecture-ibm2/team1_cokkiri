package com.coliving.infra.iot;

import java.util.List;
import java.util.Map;

/**
 * IoT 서버에서 조회한 기기 정보 DTO
 * <p>
 * IoT 기기 자체는 이름(name)을 갖지 않습니다.
 * MAC 주소 + 모델명으로 식별하며, name은 관리자가 등록 시 부여합니다.
 * capabilities는 기기 펌웨어에서 제공하는 동작 목록입니다.
 */
public record IotDeviceInfo(
    String macAddress,
    String modelName,
    String host,
    String localIp,
    List<Map<String, Object>> capabilities,
    Map<String, Object> state,
    String status,
    String errorMode
) {}
