import { apiFetch } from "@/lib/api";
import type {
  AdminDevice,
  CreateDeviceRequest,
  CreateDeviceResponse,
  UpdateDeviceRequest,
  DeviceType,
  SaveDeviceTypeRequest,
  Space,
  ControlAdminDeviceRequest,
  ControlAdminDeviceResponse,
  DevicePageResponse,
  IotDevicesResponse,
  GatewayInfo,
} from "../_types";

// ── IoT 게이트웨이 조회 ──

export async function fetchGateways() {
  return apiFetch<{ gateways: GatewayInfo[]; total: number }>("/admin/devices/gateways");
}

// ── IoT 기기 발견 (게이트웨이별 로컬 네트워크 스캔) ──

export async function discoverIotDevices(host?: string) {
  const query = host ? `?host=${encodeURIComponent(host)}` : "";
  return apiFetch<IotDevicesResponse>(`/admin/devices/iot-devices${query}`);
}

// ── Device CRUD ──

export interface DeviceListParams {
  spaceId?: number;
  deviceTypeId?: number;
  status?: string;
  isActive?: boolean;
  p?: number;
  s?: number;
}

export async function fetchDevices(params?: DeviceListParams) {
  const query = new URLSearchParams();
  if (params?.spaceId != null) query.set("spaceId", String(params.spaceId));
  if (params?.deviceTypeId != null) query.set("deviceTypeId", String(params.deviceTypeId));
  if (params?.status) query.set("status", params.status);
  if (params?.isActive != null) query.set("isActive", String(params.isActive));
  query.set("p", String(params?.p ?? 0));
  query.set("s", String(params?.s ?? 100));
  return apiFetch<DevicePageResponse>(`/admin/devices?${query.toString()}`);
}

export async function createDevice(data: CreateDeviceRequest) {
  return apiFetch<CreateDeviceResponse>("/admin/devices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeviceStatus(deviceId: number, status: string) {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateDeviceActive(deviceId: number, isActive: boolean) {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteDevice(deviceId: number) {
  return apiFetch<void>(`/admin/devices/${deviceId}`, {
    method: "DELETE",
  });
}

export async function updateDevice(deviceId: number, data: UpdateDeviceRequest) {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── DeviceType CRUD ──

export async function fetchDeviceTypes() {
  return apiFetch<DeviceType[]>("/admin/device-types");
}

export async function createDeviceType(data: SaveDeviceTypeRequest) {
  return apiFetch<DeviceType>("/admin/device-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeviceType(id: number, data: SaveDeviceTypeRequest) {
  return apiFetch<DeviceType>(`/admin/device-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDeviceType(id: number) {
  return apiFetch<void>(`/admin/device-types/${id}`, {
    method: "DELETE",
  });
}

// ── Device Control (ADM-DEV-04) ──

export async function controlAdminDevice(
  deviceId: number,
  data: ControlAdminDeviceRequest
) {
  return apiFetch<ControlAdminDeviceResponse>(`/admin/devices/${deviceId}/control`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Space ──

export async function fetchSpaces() {
  return apiFetch<Space[]>("/admin/spaces?size=100");
}

// ── Device Error Mode (Mock IoT) ──

export type ErrorMode = "normal" | "error" | "timeout" | "fault";

export async function setDeviceErrorMode(deviceId: number, mode: ErrorMode) {
  return apiFetch<{ deviceId: number; errorMode: string; message: string }>(
    `/admin/devices/${deviceId}/error-mode`,
    {
      method: "POST",
      body: JSON.stringify({ mode }),
    }
  );
}
