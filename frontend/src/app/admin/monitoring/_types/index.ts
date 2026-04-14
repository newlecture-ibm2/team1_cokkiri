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
  deviceAvailability: DeviceAvailability[];
}

export interface SpaceDeviceStatus {
  spaceName: string;
  spaceType: "PRIVATE" | "COMMON";
  deviceTypeName: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  count: number;
}

export interface ControlLog {
  controlLogId: number;
  deviceId: number;
  deviceName: string;
  deviceTypeName: string;
  spaceName: string;
  userId: number | null;
  userName: string | null;
  actorType: string;
  command: string;
  commandLabel: string | null;
  commandParams: string | null;
  result: "SUCCESS" | "FAILURE";
  errorMessage: string | null;
  correlationId: string | null;
  createdAt: string;
}

export interface ControlLogPage {
  content: ControlLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SpaceOption {
  spaceId: number;
  name: string;
  type: "PRIVATE" | "COMMON";
}

export interface DeviceAvailability {
  deviceId: number;
  deviceName: string;
  deviceTypeName: string;
  spaceName: string;
  floor: number | null;
  totalCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
}
