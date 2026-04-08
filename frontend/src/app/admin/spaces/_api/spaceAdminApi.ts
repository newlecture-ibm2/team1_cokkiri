import { apiFetch } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface RoomTypeDTO {
  roomTypeId: number;
  code: string;
  name: string;
  isSystemDefault: boolean;
}

export interface SpaceDTO {
  spaceId?: number;
  name: string;
  type: 'PRIVATE' | 'COMMON';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  floor?: number;
  area?: number;
  description?: string;
  amenities: string[];

  // Private Detail
  roomTypeId?: number;
  roomTypeName?: string;
  roomCount?: number;
  bathroomCount?: number;
  direction?: string;
  deposit?: number;
  monthlyRent?: number;
  maintenanceFee?: number;
  parkingAvailable?: boolean;

  // Common Detail
  maxCapacity?: number;
  operatingHours?: string;
  isReservable?: boolean;
  usageFee?: number;
  // Position (평면도 배치용)
  positionX?: number;
  positionY?: number;

  // Device Error (모니터링 오버레이용)
  hasDeviceError?: boolean;

  // Images
  images?: {
    imageUrl: string;
    imageType: string;
    isThumbnail: boolean;
  }[];
}

/** 응답의 중첩 구조에서 roomTypeName 안전 추출 */
export function extractRoomTypeName(space: SpaceDTO): string | undefined {
  // Backend 응답이 중첩 구조(privateDetail.roomTypeName)인 경우 대응
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nested = (space as any).privateDetail as
    | { roomTypeName?: string }
    | undefined;
  return space.roomTypeName || nested?.roomTypeName;
}

export const fetchSpaces = async () => {
  return await apiFetch<any>('/admin/spaces');
};

export const createSpace = async (data: SpaceDTO) => {
  return await apiFetch<any>('/admin/spaces', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const uploadSpaceImage = async (spaceId: number, file: File, isThumbnail: boolean = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('imageType', 'PHOTO');
  formData.append('isThumbnail', String(isThumbnail));

  const res = await fetch(`/api/admin/spaces/${spaceId}/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
};

export const fetchSpace = async (spaceId: number) => {
  return await apiFetch<SpaceDTO>(`/admin/spaces/${spaceId}`);
};

export const updateSpace = async (spaceId: number, data: Partial<SpaceDTO>) => {
  return await apiFetch<any>(`/admin/spaces/${spaceId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteSpace = async (spaceId: number) => {
  return await apiFetch<any>(`/admin/spaces/${spaceId}`, {
    method: 'DELETE',
  });
};

// ===== Room Type (방 유형) API =====

export const fetchRoomTypes = async (): Promise<ApiResponse<RoomTypeDTO[]>> => {
  return await apiFetch<RoomTypeDTO[]>('/admin/room-types');
};

export const createRoomType = async (data: { code: string; name: string }) => {
  return await apiFetch<any>('/admin/room-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateRoomType = async (roomTypeId: number, data: { name: string }) => {
  return await apiFetch<any>(`/admin/room-types/${roomTypeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteRoomType = async (roomTypeId: number) => {
  return await apiFetch<any>(`/admin/room-types/${roomTypeId}`, {
    method: 'DELETE',
  });
};
