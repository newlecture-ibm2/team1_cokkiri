import type { RoomDTO, PageResponse, RoomFilterParams } from '../_types';

export type { RoomDTO, PageResponse, RoomFilterParams };

export const fetchRooms = async (params?: RoomFilterParams) => {
  const searchParams = new URLSearchParams();
  if (params?.roomType) searchParams.set('roomType', params.roomType);
  if (params?.minRent !== undefined) searchParams.set('minRent', String(params.minRent));
  if (params?.maxRent !== undefined) searchParams.set('maxRent', String(params.maxRent));
  if (params?.floor !== undefined) searchParams.set('floor', String(params.floor));
  if (params?.page !== undefined) searchParams.set('page', String(params.page));
  if (params?.size !== undefined) searchParams.set('size', String(params.size));

  const query = searchParams.toString();
  const res = await fetch(`/api/bff/rooms${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
};

export const fetchRoom = async (spaceId: number) => {
  const res = await fetch(`/api/bff/rooms/${spaceId}`);
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
};
