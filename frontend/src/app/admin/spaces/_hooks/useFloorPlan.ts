'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchSpaces, SpaceDTO, extractRoomTypeName } from '../_api/spaceAdminApi';
import type { FloorPlanBlock } from '../_types/layout';

/** SpaceDTO → FloorPlanBlock 변환 */
function spaceToBlock(space: SpaceDTO): FloorPlanBlock {
  return {
    spaceId: space.spaceId!,
    name: space.name,
    type: space.type,
    status: space.status,
    roomTypeName: extractRoomTypeName(space),
    gridX: space.positionX ?? 0,
    gridY: space.positionY ?? 0,
    gridW: space.type === 'COMMON' ? 4 : 3,
    gridH: 2,
  };
}

export function useFloorPlan() {
  const [allSpaces, setAllSpaces] = useState<SpaceDTO[]>([]);
  const [blocks, setBlocks] = useState<FloorPlanBlock[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 전체 공간 로드
  const loadSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSpaces();
      const spaces: SpaceDTO[] = res.data?.content || res.data || [];
      setAllSpaces(spaces);

      // 첫 로드 시 가장 낮은 층을 자동 선택
      const floors = [...new Set(spaces.map((s: SpaceDTO) => s.floor).filter(Boolean))] as number[];
      floors.sort((a, b) => a - b);
      if (floors.length > 0 && selectedFloor === null) {
        setSelectedFloor(floors[0]);
      }
    } catch (e) {
      console.error('Failed to load spaces for floor plan:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  // 선택된 층에 맞는 블록들 생성
  useEffect(() => {
    if (selectedFloor === null) {
      setBlocks([]);
      return;
    }
    const filtered = allSpaces.filter((s) => s.floor === selectedFloor);
    setBlocks(filtered.map(spaceToBlock));
  }, [selectedFloor, allSpaces]);

  // 유일한 층 목록
  const floors = [
    ...new Set(allSpaces.map((s) => s.floor).filter((f): f is number => f != null)),
  ].sort((a, b) => a - b);

  // 블록 위치 업데이트 (로컬 상태만, #63에서 서버 저장)
  const updateBlockPosition = useCallback(
    (spaceId: number, gridX: number, gridY: number) => {
      setBlocks((prev) =>
        prev.map((b) => (b.spaceId === spaceId ? { ...b, gridX, gridY } : b)),
      );
    },
    [],
  );

  return {
    blocks,
    floors,
    selectedFloor,
    setSelectedFloor,
    updateBlockPosition,
    loading,
  };
}
