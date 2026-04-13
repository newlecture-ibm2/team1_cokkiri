const express = require('express');
const store = require('./store/device-store');
const handleControl = require('./handlers/control');

const app = express();
const PORT = process.env.PORT || 8000;
const ERROR_SIMULATION = process.env.ERROR_SIMULATION !== 'false';

// ERROR_SIMULATION=false일 때: 볼륨에 남아있는 ERROR 상태 기기를 ONLINE으로 리셋
if (!ERROR_SIMULATION) {
  const devices = store.getAll();
  let resetCount = 0;
  devices.forEach(device => {
    if (device.status === 'ERROR') {
      device.status = 'ONLINE';
      delete device.error_message;
      device.error_mode = 'normal';
      resetCount++;
    }
  });
  if (resetCount > 0) {
    store.save();
    console.log(`[시작] ERROR_SIMULATION=false → ${resetCount}개 에러 기기 ONLINE 리셋`);
  }
}

app.use(express.json());


// ── 헬스체크 ──
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'mock-iot-server' });
});

// ── 게이트웨이 목록 조회 (네트워크 토폴로지 표현) ──
app.get('/api/gateways', (req, res) => {
  const hosts = store.getUniqueHosts();
  const gateways = hosts.map(host => {
    const devices = store.getByHost(host);
    return {
      host,
      deviceCount: devices.length,
      onlineCount: devices.filter(d => d.status === 'ONLINE').length,
      errorCount: devices.filter(d => d.status === 'ERROR').length,
    };
  });

  res.json({
    success: true,
    gateways,
    total: gateways.length,
  });
});

// ── 게이트웨이별 기기 조회 (로컬 네트워크 스캔 시뮬레이션) ──
app.get('/api/gateways/:host/devices', (req, res) => {
  const { host } = req.params;
  const devices = store.getByHost(host);

  if (devices.length === 0) {
    return res.status(404).json({
      success: false,
      message: `게이트웨이 ${host}에 연결된 기기가 없습니다`,
    });
  }

  res.json({
    success: true,
    host,
    devices,
    total: devices.length,
  });
});

// ── 기기 목록 조회 (관리자가 기기 발견용) ──
app.get('/api/devices', (req, res) => {
  const { host } = req.query;

  const devices = host
    ? store.getByHost(host)
    : store.getAll();

  res.json({
    success: true,
    devices,
    total: devices.length,
    hosts: store.getUniqueHosts(),
  });
});

// ── 기기 단건 조회 (MAC 주소 기반) ──
app.get('/api/devices/:macAddress', (req, res) => {
  const { macAddress } = req.params;
  const device = store.getByMac(macAddress);

  if (!device) {
    return res.status(404).json({
      success: false,
      message: `MAC 주소 ${macAddress}에 해당하는 기기를 찾을 수 없습니다`,
    });
  }

  res.json({
    success: true,
    device,
  });
});

// ── 기기 제어 (메인 엔드포인트) ──
app.post('/api/devices/control', handleControl);

// ── 에러 모드 설정 (관리자 테스트용) ──
app.post('/api/devices/:macAddress/error-mode', (req, res) => {
  const { macAddress } = req.params;
  const { mode } = req.body;

  const validModes = ['normal', 'error', 'timeout', 'fault'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      success: false,
      message: `유효하지 않은 모드입니다. 가능한 값: ${validModes.join(', ')}`,
    });
  }

  const success = store.setErrorMode(macAddress, mode);
  if (!success) {
    return res.status(404).json({
      success: false,
      message: `MAC 주소 ${macAddress}에 해당하는 기기를 찾을 수 없습니다`,
    });
  }

  console.log(`[ErrorMode] mac: ${macAddress} → ${mode}`);

  res.json({
    success: true,
    mac_address: macAddress,
    error_mode: mode,
    message: `기기 ${macAddress}의 에러 모드가 '${mode}'로 설정되었습니다`,
  });
});

// ── IoT 자체 에러 시뮬레이션 (20% 확률, 1분마다) ──
if (ERROR_SIMULATION) {
  const ERROR_MESSAGES = [
    '센서 연결 불안정',
    '통신 모듈 응답 없음',
    '전원 공급 불안정',
    '펌웨어 오류 감지',
    '내부 온도 이상 감지',
  ];

  setInterval(() => {
    const devices = store.getAll();
    let errorCount = 0;

    devices.forEach(device => {
      // 관리자가 에러 모드를 설정한 기기는 건너뜀
      if (device.error_mode !== 'normal') return;
      // 이미 ERROR 상태인 기기는 70% 확률로 자동 복구
      if (device.status === 'ERROR') {
        if (Math.random() < 0.70) {
          device.status = 'ONLINE';
          delete device.error_message;
          store.save();
          console.log(`[자체 복구] ${device.mac_address} (${device.model_name}): ONLINE 복구`);
        }
        return;
      }
      // 20% 확률로 에러 발생
      if (Math.random() < 0.20) {
        const msg = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
        store.setDeviceError(device.mac_address, msg);
        errorCount++;
        console.log(`[자체 에러] ${device.mac_address} (${device.model_name}): ${msg}`);
      }
    });

    if (errorCount > 0) {
      console.log(`[에러 시뮬레이션] ${errorCount}개 기기에 에러 발생`);
    }
  }, 60_000); // 1분마다

  console.log('⚠️  IoT 자체 에러 시뮬레이션 활성화 (20% 확률, 1분 주기)');
}

// ── 서버 시작 ──
app.listen(PORT, () => {
  console.log(`\n🔌 Mock IoT Server running on port ${PORT}`);
  console.log(`   Health:      GET  http://localhost:${PORT}/health`);
  console.log(`   Gateways:    GET  http://localhost:${PORT}/api/gateways`);
  console.log(`   GW Devices:  GET  http://localhost:${PORT}/api/gateways/:host/devices`);
  console.log(`   Devices:     GET  http://localhost:${PORT}/api/devices`);
  console.log(`   Device:      GET  http://localhost:${PORT}/api/devices/:macAddress`);
  console.log(`   Control:     POST http://localhost:${PORT}/api/devices/control`);
  console.log(`   ErrorMode:   POST http://localhost:${PORT}/api/devices/:macAddress/error-mode\n`);
});
