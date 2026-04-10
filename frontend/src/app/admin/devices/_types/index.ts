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

export interface SaveDeviceTypeRequest {
  code: string;
  name: string;
  commands: string;
  uiType: string;
}

export interface CreateDeviceRequest {
  spaceId: number;
  deviceTypeId: number;
  name: string;
  modelName: string;
  macAddress: string;
  mockEndpoint: string;
  currentState?: string;
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
