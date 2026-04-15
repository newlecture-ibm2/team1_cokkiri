export interface DeviceType {
  deviceTypeId: number;
  code: string;
  name: string;
  commands: string;
  uiType: string;
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 구조화된 명령어 정의 (device_types.commands JSONB 내부 구조) */
export interface DeviceCommand {
  command: string;
  uiType: "toggle" | "slider" | "select" | "button";
  stateKey: string;
  label: string;
  stateValue?: unknown;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
  /** 이 명령을 지원하는 모델명 목록. 미지정 시 모든 모델에 표시 */
  models?: string[];
}

export interface SaveDeviceTypeRequest {
  code: string;
  name: string;
  commands: string;
  uiType: string;
}

export interface CreateDeviceRequest {
  macAddress: string;   // IoT 목록에서 선택된 기기의 MAC (자동)
  name: string;         // 관리자가 부여하는 기기 이름
  spaceId: number;      // 관리자 선택
  deviceTypeId: number; // 관리자 선택
}

/** IoT 기기 동작 정의 (기기 펌웨어에서 제공 — UI 매핑은 관리자가 결정) */
export interface DeviceCapability {
  command: string;
  stateKey: string;
  stateValue?: unknown;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
}

/** IoT 서버에서 조회한 기기 정보 (name 없음 — IoT 기기 자체는 이름을 갖지 않음) */
export interface IotDeviceInfo {
  macAddress: string;
  modelName: string;
  host: string;
  localIp: string;
  capabilities: DeviceCapability[];
  state: Record<string, unknown>;
  status: string;
  errorMode: string;
}

/** IoT 기기 목록 응답 */
export interface IotDevicesResponse {
  devices: IotDeviceInfo[];
  total: number;
}

/** IoT 게이트웨이 정보 */
export interface GatewayInfo {
  host: string;
  deviceCount: number;
  onlineCount: number;
  errorCount: number;
}

export interface CreateDeviceResponse {
  deviceId: number;
  spaceId: number;
  deviceTypeId: number;
  deviceTypeCode: string;
  deviceTypeName: string;
  name: string;
  modelName: string;
  macAddress: string;
  mockEndpoint: string;
  status: string;
  isActive: boolean;
  installedAt: string;
  createdAt: string;
}

export interface UpdateDeviceRequest {
  name: string;
  spaceId: number;
  modelName: string;
  macAddress: string;
  mockEndpoint: string;
}

export interface Space {
  spaceId: number;
  name: string;
  type: "PRIVATE" | "COMMON";
  status: string;
  floor: number;
}

export interface AdminDevice {
  deviceId: number;
  spaceId: number;
  spaceName: string | null;
  spaceFloor: number | null;
  deviceTypeId: number;
  deviceTypeCode: string;
  deviceTypeName: string;
  deviceTypeCommands: string;
  name: string;
  modelName: string;
  macAddress: string;
  mockEndpoint: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  currentState: string;
  isActive: boolean;
  installedAt: string;
  lastOnlineAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── Device Control (ADM-DEV-04) ──

export interface ControlAdminDeviceRequest {
  command: string;
  params?: Record<string, unknown>;
}

export interface ControlAdminDeviceResponse {
  deviceId: number;
  command: string;
  success: boolean;
  message: string;
}

export interface DevicePageResponse {
  content: AdminDevice[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
