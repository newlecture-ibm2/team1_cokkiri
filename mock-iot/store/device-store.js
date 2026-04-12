const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'devices.json');
const SEED_PATH = path.join(__dirname, '..', 'seed', 'default-devices.json');
const CAPS_PATH = path.join(__dirname, '..', 'seed', 'capabilities.json');

/**
 * JSON 파일 기반 기기 상태 저장소 (MAC 주소 기반)
 *
 * - Docker Named Volume에 devices.json 파일로 영속 저장
 * - 최초 기동 시 시드 데이터(default-devices.json)에서 초기화
 * - capabilities.json에서 모델별 동작 정의를 자동 매핑
 * - 컨테이너 재시작 후에도 상태 유지
 * - 구조: Array<DeviceObject> (MAC 주소로 식별)
 */

/** 모델별 capabilities 로드 */
function loadCapabilities() {
  try {
    if (fs.existsSync(CAPS_PATH)) {
      const raw = fs.readFileSync(CAPS_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[DeviceStore] capabilities 파일 로드 실패:', err.message);
  }
  return {};
}

const CAPABILITIES = loadCapabilities();

/** 시드 데이터 로드 + capabilities 매핑 */
function loadSeed() {
  try {
    if (fs.existsSync(SEED_PATH)) {
      const raw = fs.readFileSync(SEED_PATH, 'utf-8');
      const seedDevices = JSON.parse(raw);
      // 모델명 기반으로 capabilities 자동 매핑
      return seedDevices.map(device => ({
        ...device,
        capabilities: CAPABILITIES[device.model_name] || [],
      }));
    }
  } catch (err) {
    console.error('[DeviceStore] 시드 파일 로드 실패:', err.message);
  }
  return [];
}

/** 파일에서 기기 데이터 로드 (없으면 시드에서 초기화) */
function load() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        // 기존 데이터에 capabilities가 없으면 매핑 보강
        return data.map(device => {
          if (!device.capabilities) {
            device.capabilities = CAPABILITIES[device.model_name] || [];
          }
          return device;
        });
      }
    }
  } catch (err) {
    console.error('[DeviceStore] 파일 로드 실패:', err.message);
  }

  // 데이터 파일이 없거나 비어있으면 시드에서 초기화
  console.log('[DeviceStore] 기존 데이터 없음 → 시드 데이터에서 초기화');
  const seed = loadSeed();
  if (seed.length > 0) {
    saveData(seed);
  }
  return seed;
}

/** 기기 데이터를 파일에 저장 */
function saveData(data) {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[DeviceStore] 파일 저장 실패:', err.message);
  }
}

// 서버 시작 시 파일에서 로드
let devices = load();
console.log(`[DeviceStore] ${devices.length}개 기기 로드 완료`);

/** 저장 (현재 devices 배열을 파일에 기록) */
function save() {
  saveData(devices);
}

/** 전체 기기 목록 조회 */
function getAll() {
  return [...devices];
}

/** 게이트웨이 IP(host)별 기기 목록 조회 */
function getByHost(host) {
  return devices.filter(d => d.host === host);
}

/** MAC 주소로 기기 단건 조회 */
function getByMac(macAddress) {
  return devices.find(d => d.mac_address === macAddress) || null;
}

/**
 * 제어 명령 실행 → 상태 업데이트 → 변경된 전체 상태 반환
 *
 * capabilities에서 해당 command를 찾아 stateKey/stateValue를 적용하고,
 * 추가 params가 있으면 state에 병합합니다.
 */
function executeCommand(macAddress, command, params) {
  const device = getByMac(macAddress);
  if (!device) return null;

  // capabilities에서 해당 command의 stateKey/stateValue 적용
  const cap = (device.capabilities || []).find(c => c.command === command);
  if (cap) {
    if (cap.stateValue !== undefined) {
      device.state[cap.stateKey] = cap.stateValue;
    }
  }

  // params를 기존 상태에 병합 (SET_TEMP {temperature:24} 등)
  if (params && typeof params === 'object') {
    Object.assign(device.state, params);
    // null 값으로 전달된 키는 제거
    for (const key of Object.keys(device.state)) {
      if (device.state[key] === null) {
        delete device.state[key];
      }
    }
  }

  save();
  return { ...device.state };
}

/**
 * 에러 모드 설정
 * @param {string} macAddress
 * @param {string} mode - "normal" | "error" | "timeout" | "fault"
 */
function setErrorMode(macAddress, mode) {
  const device = getByMac(macAddress);
  if (!device) return false;
  device.error_mode = mode;
  if (mode !== 'normal') {
    device.status = 'ERROR';
  } else {
    device.status = 'ONLINE';
  }
  save();
  return true;
}

/**
 * 에러 모드 조회
 */
function getErrorMode(macAddress) {
  const device = getByMac(macAddress);
  return device ? device.error_mode : 'normal';
}

/**
 * 기기 상태(status)를 ERROR로 변경 (자체 에러 시뮬레이션용)
 */
function setDeviceError(macAddress, errorMessage) {
  const device = getByMac(macAddress);
  if (!device) return;
  device.status = 'ERROR';
  device.error_message = errorMessage;
  save();
}

/**
 * 고유 게이트웨이 IP 목록 반환
 */
function getUniqueHosts() {
  return [...new Set(devices.map(d => d.host))];
}

module.exports = {
  getAll,
  getByHost,
  getByMac,
  executeCommand,
  setErrorMode,
  getErrorMode,
  setDeviceError,
  getUniqueHosts,
  save,
};
