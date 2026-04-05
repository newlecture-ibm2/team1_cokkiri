export interface DeviceType {
  deviceTypeId: number;
  code: string;
  name: string;
  uiType: string;
}

export interface CreateDeviceRequest {
  spaceId: number;
  deviceTypeId: number;
  name: string;
  modelName: string;
  macAddress: string;
  mockEndpoint: string;
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

export interface Space {
  spaceId: number;
  name: string;
  type: "PRIVATE" | "COMMON";
  status: string;
  floor: number;
}
