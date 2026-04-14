const store = require('../store/device-store');

/**
 * POST /api/devices/control
 *
 * 기기 제어 명령 처리 (MAC 주소 기반):
 * 1. MAC 주소로 기기 조회
 * 2. 에러 모드 확인 → 에러/타임아웃/연결끊김 시뮬레이션
 * 3. 명령 실행 → 상태 업데이트
 * 4. 변경된 전체 상태 반환
 */
function handleControl(req, res) {
  const { mac_address, command, params } = req.body;

  if (!mac_address || !command) {
    return res.status(400).json({
      success: false,
      mac_address,
      command,
      result: 'FAILURE',
      state: null,
      message: 'mac_address와 command는 필수입니다',
      executed_at: new Date().toISOString(),
    });
  }

  // 기기 존재 확인
  const device = store.getByMac(mac_address);
  if (!device) {
    return res.status(404).json({
      success: false,
      mac_address,
      command,
      result: 'FAILURE',
      state: null,
      message: `MAC 주소 ${mac_address}에 해당하는 기기를 찾을 수 없습니다`,
      executed_at: new Date().toISOString(),
    });
  }

  // 기기 상태가 ERROR인 경우 → 제어 불가 (복구는 랜덤 시뮬레이션에서만)
  if (device.status === 'ERROR') {
    console.log(`[Control] mac: ${mac_address}, command: ${command} → 기기 ERROR 상태, 제어 실패`);
    return res.status(503).json({
      success: false,
      mac_address,
      command,
      result: 'FAILURE',
      state: null,
      message: '기기가 오류 상태입니다. 자동 복구를 기다려주세요',
      executed_at: new Date().toISOString(),
    });
  }

  // 에러 모드 확인 (관리자 테스트 트리거)
  const errorMode = store.getErrorMode(mac_address);

  if (errorMode === 'error') {
    console.log(`[Control] mac: ${mac_address}, command: ${command} → ERROR 모드 (500)`);
    return res.status(500).json({
      success: false,
      mac_address,
      command,
      result: 'FAILURE',
      state: null,
      message: 'IoT 기기 내부 오류가 발생했습니다',
      executed_at: new Date().toISOString(),
    });
  }

  if (errorMode === 'timeout') {
    console.log(`[Control] mac: ${mac_address}, command: ${command} → TIMEOUT 모드 (6초 지연)`);
    setTimeout(() => {
      res.status(504).json({
        success: false,
        mac_address,
        command,
        result: 'FAILURE',
        state: null,
        message: 'IoT 기기 응답 타임아웃',
        executed_at: new Date().toISOString(),
      });
    }, 6000);
    return;
  }

  if (errorMode === 'fault') {
    console.log(`[Control] mac: ${mac_address}, command: ${command} → FAULT 모드 (연결 끊김)`);
    res.destroy();
    return;
  }

  // 일시적 통신 오류 시뮬레이션 (ONLINE 기기도 10% 확률로 통신 실패)
  if (Math.random() < 0.1) {
    console.log(`[Control] mac: ${mac_address}, command: ${command} → 일시적 통신 오류 (10% 확률)`);
    return res.status(502).json({
      success: false,
      mac_address,
      command,
      result: 'FAILURE',
      state: null,
      message: '일시적 통신 오류가 발생했습니다. 다시 시도해주세요',
      executed_at: new Date().toISOString(),
    });
  }

  // 정상 처리: 명령 실행 + 상태 업데이트
  const updatedState = store.executeCommand(mac_address, command, params || {});

  console.log(`[Control] mac: ${mac_address}, command: ${command} → SUCCESS, state:`, updatedState);

  return res.status(200).json({
    success: true,
    mac_address,
    command,
    result: 'SUCCESS',
    state: updatedState,
    message: '기기 제어 완료',
    executed_at: new Date().toISOString(),
  });
}

module.exports = handleControl;
