import type { RoomDTO, PageResponse, RoomFilterParams } from '../_types';

export type { RoomDTO, PageResponse, RoomFilterParams };

export const fetchRooms = async (params?: RoomFilterParams) => {
  const searchParams = new URLSearchParams();
  if (params?.roomTypeId !== undefined) searchParams.set('roomTypeId', String(params.roomTypeId));
  if (params?.minRent !== undefined) searchParams.set('minRent', String(params.minRent));
  if (params?.maxRent !== undefined) searchParams.set('maxRent', String(params.maxRent));
  if (params?.floor !== undefined) searchParams.set('floor', String(params.floor));
  if (params?.page !== undefined) searchParams.set('page', String(params.page));
  if (params?.size !== undefined) searchParams.set('size', String(params.size));

  const query = searchParams.toString();
  const res = await fetch(`/api/rooms${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
};

export const fetchRoom = async (spaceId: number) => {
  const res = await fetch(`/api/rooms/${spaceId}`);
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
};

export const fetchPublicRoomTypes = async () => {
  // 방 목록 전체를 가져와서 고유 roomType 추출 (공개 API로 roomTypes 별도 제공 전까지)
  const res = await fetch('/api/rooms?size=100');
  if (!res.ok) return [];
  const data = await res.json();
  const rooms: RoomDTO[] = data.data?.content || [];

  const typeMap = new Map<number, { roomTypeId: number; code: string; name: string }>();
  rooms.forEach((room) => {
    if (room.roomTypeId && room.roomTypeName) {
      typeMap.set(room.roomTypeId, {
        roomTypeId: room.roomTypeId,
        code: room.roomTypeName,
        name: room.roomTypeName,
      });
    }
  });

  return Array.from(typeMap.values());
};
