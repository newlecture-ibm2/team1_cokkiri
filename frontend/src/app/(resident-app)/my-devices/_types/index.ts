export interface MyDevice {
  deviceId: number;
  spaceId: number;
  spaceName: string | null;
  spaceType: "PRIVATE" | "COMMON";
  spaceFloor: number | null;
  deviceTypeCode: string;
  deviceTypeName: string;
  uiType: string;
  commands: string;
  name: string;
  modelName: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  currentState: string;
  isActive: boolean;
  lastOnlineAt: string | null;
  controllable: boolean;
}

export interface ControlDeviceRequest {
  command: string;
  params?: Record<string, unknown>;
}

export interface ControlDeviceResponse {
  deviceId: number;
  command: string;
  success: boolean;
  message: string;
}
