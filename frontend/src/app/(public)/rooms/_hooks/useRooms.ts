'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchRooms, fetchPublicRoomTypes, fetchPriceRanges } from '../_api/roomApi';
import type { RoomDTO, RoomFilterParams, RoomTypeOption, PriceRangePreset } from '../_types';

export type SortOption = 'name,asc' | 'spaceId,desc' | 'name,desc' | 'monthlyRent,asc' | 'monthlyRent,desc';

export function useRooms() {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRangePreset[]>([]);
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('name,asc');
  const [keyword, setKeyword] = useState<string>('');

  // 방 유형 목록 로드
  useEffect(() => {
    fetchPublicRoomTypes()
      .then(setRoomTypes)
      .catch(console.error);
      
    fetchPriceRanges()
      .then(setPriceRanges)
      .catch(console.error);
  }, []);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const selectedPriceRange = priceRanges.find(p => p.priceRangePresetId === selectedPriceRangeId);
      
      const params: RoomFilterParams = {
        keyword: keyword || undefined,
        roomTypeId: selectedTypeId ?? undefined,
        minRent: selectedPriceRange?.minRent ?? undefined,
        maxRent: selectedPriceRange?.maxRent ?? undefined,
        page: currentPage,
        size: 12,
        sort: sortOption,
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
  }, [selectedTypeId, selectedPriceRangeId, priceRanges, currentPage, sortOption, keyword]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTypeId, selectedPriceRangeId, sortOption, keyword]);

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
    sortOption,
    setSortOption,
    keyword,
    setKeyword,
    priceRanges,
    selectedPriceRangeId,
    setSelectedPriceRangeId,
  };
}
