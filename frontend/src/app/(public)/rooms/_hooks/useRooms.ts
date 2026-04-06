'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchRooms } from '../_api/roomApi';
import type { RoomDTO, RoomFilterParams } from '../_types';

export function useRooms() {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params: RoomFilterParams = {
        roomType: selectedType === 'ALL' ? undefined : selectedType,
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
  }, [selectedType, currentPage]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedType]);

  return {
    rooms,
    loading,
    selectedType,
    setSelectedType,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  };
}
