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
  const res = await fetch('/api/bff/admin/spaces');
  if (!res.ok) throw new Error('Failed to fetch spaces');
  return res.json();
};

export const createSpace = async (data: SpaceDTO) => {
  const res = await fetch('/api/bff/admin/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create space');
  return res.json();
};

export const uploadSpaceImage = async (spaceId: number, file: File, isThumbnail: boolean = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('imageType', 'PHOTO');
  formData.append('isThumbnail', String(isThumbnail));

  const res = await fetch(`/api/bff/admin/spaces/${spaceId}/images`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
};

export const fetchSpace = async (spaceId: number) => {
  const res = await fetch(`/api/bff/admin/spaces/${spaceId}`);
  if (!res.ok) throw new Error('Failed to fetch space');
  return res.json();
};

export const updateSpace = async (spaceId: number, data: Partial<SpaceDTO>) => {
  const res = await fetch(`/api/bff/admin/spaces/${spaceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update space');
  return res.json();
};

export const deleteSpace = async (spaceId: number) => {
  const res = await fetch(`/api/bff/admin/spaces/${spaceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete space');
  return res.json();
};

// ===== Room Type (방 유형) API =====

export const fetchRoomTypes = async (): Promise<{ success: boolean; data: RoomTypeDTO[] }> => {
  const res = await fetch('/api/bff/admin/room-types');
  if (!res.ok) throw new Error('Failed to fetch room types');
  return res.json();
};

export const createRoomType = async (data: { code: string; name: string }) => {
  const res = await fetch('/api/bff/admin/room-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create room type');
  return res.json();
};

export const updateRoomType = async (roomTypeId: number, data: { name: string }) => {
  const res = await fetch(`/api/bff/admin/room-types/${roomTypeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update room type');
  return res.json();
};

export const deleteRoomType = async (roomTypeId: number) => {
  const res = await fetch(`/api/bff/admin/room-types/${roomTypeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to delete room type');
  }
  return res.json();
};
