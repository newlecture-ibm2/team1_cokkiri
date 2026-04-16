import type { RoomDTO, PageResponse, RoomFilterParams } from '../_types';

export type { RoomDTO, PageResponse, RoomFilterParams };

export const fetchRooms = async (params?: RoomFilterParams) => {
  const searchParams = new URLSearchParams();
  if (params?.keyword) searchParams.set('keyword', params.keyword);
  if (params?.roomTypeId !== undefined) searchParams.set('roomTypeId', String(params.roomTypeId));
  if (params?.minRent !== undefined) searchParams.set('minRent', String(params.minRent));
  if (params?.maxRent !== undefined) searchParams.set('maxRent', String(params.maxRent));
  if (params?.floor !== undefined) searchParams.set('floor', String(params.floor));
  if (params?.page !== undefined) searchParams.set('page', String(params.page));
  if (params?.size !== undefined) searchParams.set('size', String(params.size));
  if (params?.sort) searchParams.set('sort', params.sort);

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
  const res = await fetch('/api/room-types');
  if (!res.ok) return [];
  const data = await res.json();
  const types = data.data || [];
  return types.map((rt: { roomTypeId: number; code: string; name: string; sortOrder: number }) => ({
    roomTypeId: rt.roomTypeId,
    code: rt.code,
    name: rt.name,
  }));
};

export const fetchPriceRanges = async () => {
  const res = await fetch('/api/price-ranges');
  if (!res.ok) return [];
  const data = await res.json();
  const ranges = data.data || [];
  return ranges.map((pr: any) => ({
    priceRangePresetId: pr.priceRangePresetId,
    label: pr.label,
    minRent: pr.minRent,
    maxRent: pr.maxRent,
    sortOrder: pr.sortOrder,
  }));
};
