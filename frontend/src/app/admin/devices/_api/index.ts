import { apiFetch } from "@/lib/api";
import type {
  AdminDevice,
  CreateDeviceRequest,
  CreateDeviceResponse,
  UpdateDeviceRequest,
  DeviceType,
  SaveDeviceTypeRequest,
  Space,
} from "../_types";

// ── Device CRUD ──

export async function fetchDevices() {
  return apiFetch<AdminDevice[]>("/admin/devices");
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

// ── Space ──

export async function fetchSpaces() {
  return apiFetch<Space[]>("/admin/spaces?size=100");
}
