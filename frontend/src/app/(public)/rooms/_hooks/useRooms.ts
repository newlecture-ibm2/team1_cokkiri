'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchRooms, fetchPublicRoomTypes } from '../_api/roomApi';
import type { RoomDTO, RoomFilterParams, RoomTypeOption } from '../_types';

export function useRooms() {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);

  // 방 유형 목록 로드
  useEffect(() => {
    fetchPublicRoomTypes()
      .then(setRoomTypes)
      .catch(console.error);
  }, []);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params: RoomFilterParams = {
        roomTypeId: selectedTypeId ?? undefined,
        page: currentPage,
        size: 12,
      };
      const res = await fetchRooms(params);
      const pageData = res.data;
      setRooms(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(pageData?.totalElements || 0);
    } catch (e) {
      console.error(e);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTypeId, currentPage]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTypeId]);

  return {
    rooms,
    loading,
    roomTypes,
    selectedTypeId,
    setSelectedTypeId,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  };
}
