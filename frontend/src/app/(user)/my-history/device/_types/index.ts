export interface ControlLogItem {
  controlLogId: number;
  deviceId: number;
  deviceName: string;
  deviceTypeCode: string | null;
  deviceTypeName: string | null;
  spaceId: number | null;
  spaceName: string;
  spaceType: string | null;
  actorType: string;
  command: string;
  commandLabel: string | null;
  commandParams: string | null;
  result: "SUCCESS" | "FAILURE";
  errorMessage: string | null;
  createdAt: string;
}

export interface ControlLogPage {
  content: ControlLogItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  successCount: number;
  failureCount: number;
}

export interface ControlLogFilters {
  startDate?: string;
  endDate?: string;
  spaceType?: string;
  deviceTypeCode?: string;
  result?: string;
}

export interface DeviceTypeOption {
  code: string;
  name: string;
}
