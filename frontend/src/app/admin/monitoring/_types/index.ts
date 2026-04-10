export interface DeviceErrorStats {
  deviceId: number;
  deviceName: string;
  deviceTypeCode: string;
  deviceTypeName: string;
  spaceName: string;
  status: string;
  errorCount: number;
  lastOnlineAt: string | null;
}

export interface ControlFrequency {
  label: string;
  count: number;
}

export interface DeviceTypeCommandFrequency {
  deviceTypeName: string;
  command: string;
  count: number;
}

export interface DeviceStatusSummary {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  errorCount: number;
}

export interface EnergyStatsResponse {
  statusSummary: DeviceStatusSummary;
  frequencyByType: ControlFrequency[];
  dailyFrequency: ControlFrequency[];
  frequencyBySpaceType: ControlFrequency[];
  frequencyByCommand: ControlFrequency[];
  frequencyByDeviceTypeAndCommand: DeviceTypeCommandFrequency[];
  dailyErrorFrequency: ControlFrequency[];
  deviceStatusBySpace: SpaceDeviceStatus[];
}

export interface SpaceDeviceStatus {
  spaceName: string;
  spaceType: "PRIVATE" | "COMMON";
  deviceTypeName: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  count: number;
}
