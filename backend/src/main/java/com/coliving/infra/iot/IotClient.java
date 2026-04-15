package com.coliving.infra.iot;

import java.util.List;
import java.util.Map;

/**
 * IoT 기기 통신 추상 인터페이스 (OCP)
 *
 * 현재 구현체: {@link MockIotClient} (Custom Mock IoT Server 기반)
 * 추후 SmartThings 등 실제 IoT 벤더 연동 시 구현체만 교체하면 됩니다.
 */
public interface IotClient {

    /**
     * IoT 기기에 제어 명령을 전송합니다.
     *
     * @param deviceId 기기 ID (DB PK)
     * @param command  제어 명령 (예: "ON", "OFF", "SET_TEMP")
     * @param params   추가 파라미터
     * @return IoT 응답 (성공 여부 + 기기 최신 상태)
     */
    IotResponse sendCommand(Long deviceId, String command, Map<String, Object> params);

    /**
     * IoT 네트워크의 게이트웨이 목록을 조회합니다.
     * 각 게이트웨이별 연결된 기기 수와 상태 요약을 반환합니다.
     *
     * @return 게이트웨이 정보 목록
     */
    List<IotGatewayInfo> discoverGateways();

    /**
     * IoT 서버에 존재하는 전체 기기 목록을 조회합니다.
     *
     * @return IoT 기기 정보 목록
     */
    List<IotDeviceInfo> discoverDevices();

    /**
     * 특정 게이트웨이 IP(host)에 연결된 기기 목록을 조회합니다.
     *
     * @param host 게이트웨이 IP (예: "192.168.1.101")
     * @return 해당 호스트의 기기 목록
     */
    List<IotDeviceInfo> discoverDevicesByHost(String host);

    /**
     * MAC 주소로 IoT 서버의 기기를 단건 조회합니다.
     *
     * @param macAddress MAC 주소
     * @return 기기 정보 (없으면 null)
     */
    IotDeviceInfo getDeviceByMac(String macAddress);

    /**
     * IoT 기기의 에러 시뮬레이션 모드를 설정합니다.
     *
     * @param macAddress MAC 주소
     * @param mode       에러 모드 ("normal" | "error" | "timeout" | "fault")
     * @return 설정 성공 여부
     */
    boolean setErrorMode(String macAddress, String mode);
}
