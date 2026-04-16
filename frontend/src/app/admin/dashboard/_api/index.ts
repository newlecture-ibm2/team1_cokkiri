import { apiFetch } from "@/lib/api";

export interface DashboardDeviceStatus {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  errorCount: number;
}

export interface DashboardSpaceDeviceStatus {
  spaceName: string;
  spaceType: "PRIVATE" | "COMMON";
  deviceTypeName: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  count: number;
}

export interface DashboardControlLog {
  controlLogId: number;
  deviceName: string;
  deviceTypeName: string;
  spaceName: string;
  actorType: string;
  command: string;
  result: "SUCCESS" | "FAILURE";
  createdAt: string;
}

export interface DashboardControlLogPage {
  content: DashboardControlLog[];
  totalElements: number;
}

export interface DashboardSummary {
  contract: {
    total: number;
    pending: number;
    active: number;
    expired: number;
  };
  reservation: {
    today: number;
    pending: number;
    total: number;
  };
  resident: {
    total: number;
  };
  visitor: {
    today: number;
  };
}

export async function fetchDashboardEnergy() {
  const res = await apiFetch<DashboardEnergyData>("/admin/monitoring/energy");
  return res.data;
}

export async function fetchDashboardSummary() {
  const res = await apiFetch<DashboardSummary>("/admin/dashboard/summary");
  return res.data;
}

export async function fetchDashboardRecentLogs() {
  const res = await apiFetch<DashboardControlLogPage>(
    "/admin/control-logs?p=0&s=30"
  );
  return res.data;
}
