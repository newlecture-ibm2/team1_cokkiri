'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchFloors } from '../_api/floorApi';
import type { FloorData } from '../_types';

export function usePublicFloorMap() {
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchFloors();
      const data = res.data ?? [];
      setFloors(data);
      if (data.length > 0 && selectedFloor === null) {
        setSelectedFloor(data[0].floor);
      }
    } catch (err) {
      console.error('[FloorMap] 평면도 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currentFloor = floors.find((f) => f.floor === selectedFloor) ?? null;
  const floorNumbers = floors.map((f) => f.floor);

  return {
    floors,
    floorNumbers,
    selectedFloor,
    setSelectedFloor,
    currentFloor,
    loading,
  };
}
