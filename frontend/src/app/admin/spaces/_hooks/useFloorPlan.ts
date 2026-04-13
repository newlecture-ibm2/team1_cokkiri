'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchSpaces,
  updateSpaceLayout,
  SpaceDTO,
  extractRoomTypeName,
  fetchFloorPlan,
  updateFloorPlan,
  uploadBlueprint,
  deleteBlueprint,
} from '../_api/spaceAdminApi';
import type { FloorPlanBlock, FloorPlanData, FloorAnnotation } from '../_types/layout';

/** SpaceDTO → FloorPlanBlock 변환 (DB 값 우선, 없으면 기본값) */
function spaceToBlock(space: SpaceDTO): FloorPlanBlock {
  return {
    spaceId: space.spaceId!,
    name: space.name,
    type: space.type,
    status: space.status,
    roomTypeName: extractRoomTypeName(space),
    gridX: space.positionX ?? 0,
    gridY: space.positionY ?? 0,
    gridW: space.positionW ?? (space.type === 'COMMON' ? 8 : 6),
    gridH: space.positionH ?? 4,
    hasDeviceError: space.hasDeviceError ?? false,
  };
}

interface OriginalState {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function useFloorPlan() {
  const [allSpaces, setAllSpaces] = useState<SpaceDTO[]>([]);
  const [blocks, setBlocks] = useState<FloorPlanBlock[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 평면도 (배경/어노테이션) 상태
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const [fpDirty, setFpDirty] = useState(false);

  // 원본 좌표+크기 스냅샷 (dirty 판별용)
  const originalPositions = useRef<Map<number, OriginalState>>(new Map());

  // 전체 공간 로드
  const loadSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSpaces();
      const spaces: SpaceDTO[] = res.data?.content || res.data || [];
      setAllSpaces(spaces);

      // 원본 좌표+크기 기록
      const posMap = new Map<number, OriginalState>();
      spaces.forEach((s: SpaceDTO) => {
        if (s.spaceId != null) {
          posMap.set(s.spaceId, {
            x: s.positionX ?? 0,
            y: s.positionY ?? 0,
            w: s.positionW ?? (s.type === 'COMMON' ? 8 : 6),
            h: s.positionH ?? 4,
          });
        }
      });
      originalPositions.current = posMap;

      // 첫 로드 시 가장 낮은 층을 자동 선택
      const floors = [...new Set(spaces.map((s: SpaceDTO) => s.floor).filter(Boolean))] as number[];
      floors.sort((a, b) => a - b);
      if (floors.length > 0 && selectedFloor === null) {
        setSelectedFloor(floors[0]);
      }
      setDirty(false);
    } catch (e) {
      console.error('Failed to load spaces for floor plan:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  // 배치가 선택된 층일 때, 해당 층의 평면도 데이터를 가져옴
  const loadFloorPlan = useCallback(async (floor: number) => {
    try {
      const res = await fetchFloorPlan(floor);
      if (res.data) {
        setFloorPlan(res.data);
      }
      setFpDirty(false);
    } catch (e) {
      console.error('Failed to load floor plan:', e);
    }
  }, []);

  // 선택된 층에 맞는 블록들 생성 및 평면도 로드
  useEffect(() => {
    if (selectedFloor === null) {
      setBlocks([]);
      setFloorPlan(null);
      return;
    }
    const filtered = allSpaces.filter((s) => s.floor === selectedFloor);
    setBlocks(filtered.map(spaceToBlock));
    loadFloorPlan(selectedFloor);
  }, [selectedFloor, allSpaces, loadFloorPlan]);

  // 유일한 층 목록
  const floors = [
    ...new Set(allSpaces.map((s) => s.floor).filter((f): f is number => f != null)),
  ].sort((a, b) => a - b);

  // 블록 위치 업데이트 (로컬 상태)
  const updateBlockPosition = useCallback(
    (spaceId: number, gridX: number, gridY: number) => {
      setBlocks((prev) =>
        prev.map((b) => (b.spaceId === spaceId ? { ...b, gridX, gridY } : b)),
      );
      setDirty(true);
      setSaveMessage(null);
    },
    [],
  );

  // 블록 크기 업데이트 (로컬 상태)
  const updateBlockSize = useCallback(
    (spaceId: number, gridW: number, gridH: number) => {
      setBlocks((prev) =>
        prev.map((b) => (b.spaceId === spaceId ? { ...b, gridW, gridH } : b)),
      );
      setDirty(true);
      setSaveMessage(null);
    },
    [],
  );

  // 배치 저장 (서버 전송)
  const saveLayout = useCallback(async () => {
    if (!dirty || blocks.length === 0) return;

    // 변경된 블록만 필터링 (위치 또는 크기 변경)
    const changed = blocks.filter((b) => {
      const orig = originalPositions.current.get(b.spaceId);
      return !orig || orig.x !== b.gridX || orig.y !== b.gridY || orig.w !== b.gridW || orig.h !== b.gridH;
    });

    if (changed.length === 0) {
      setDirty(false);
      setSaveMessage('변경된 항목이 없습니다.');
      return;
    }

    try {
      setSaving(true);
      await updateSpaceLayout(
        changed.map((b) => ({
          spaceId: b.spaceId,
          positionX: b.gridX,
          positionY: b.gridY,
          positionW: b.gridW,
          positionH: b.gridH,
        })),
      );

      // 원본 좌표+크기 갱신
      changed.forEach((b) => {
        originalPositions.current.set(b.spaceId, { x: b.gridX, y: b.gridY, w: b.gridW, h: b.gridH });
      });

      setDirty(false);
      setSaveMessage(`${changed.length}개 공간의 배치가 저장되었습니다.`);
    } catch (e) {
      console.error('Failed to save layout:', e);
      setSaveMessage('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }, [blocks, dirty]);

  // 평면도 저장 (서버 전송)
  const saveFloorPlanState = useCallback(async () => {
    if (!fpDirty || selectedFloor === null || !floorPlan) return;

    try {
      setSaving(true);
      await updateFloorPlan(selectedFloor, {
        blueprintOpacity: floorPlan.blueprintOpacity,
        annotations: floorPlan.annotations,
      });
      setFpDirty(false);
      setSaveMessage((prev) => (prev ? prev + ' 평면도 구성이 저장되었습니다.' : '평면도 구성이 저장되었습니다.'));
    } catch (e) {
      console.error('Failed to save floor plan:', e);
      setSaveMessage('평면도 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [fpDirty, floorPlan, selectedFloor]);

  // 전체 저장 함수 (블록 + 평면도)
  const saveAll = useCallback(async () => {
    setSaveMessage(null);
    if (dirty) await saveLayout();
    if (fpDirty) await saveFloorPlanState();
  }, [dirty, fpDirty, saveLayout, saveFloorPlanState]);

  // 평면도 조작 함수들
  const updateBlueprintOpacity = useCallback((opacity: number) => {
    setFloorPlan((prev) => (prev ? { ...prev, blueprintOpacity: opacity } : prev));
    setFpDirty(true);
  }, []);

  const handleUploadBlueprint = useCallback(
    async (file: File) => {
      if (selectedFloor === null) return;
      try {
        setSaving(true);
        const res = await uploadBlueprint(selectedFloor, file);
        if (res.data) setFloorPlan(res.data);
        setSaveMessage('도면이 업로드되었습니다.');
      } catch (e) {
        console.error(e);
        setSaveMessage('도면 업로드에 실패했습니다.');
      } finally {
        setSaving(false);
      }
    },
    [selectedFloor]
  );

  const handleDeleteBlueprint = useCallback(async () => {
    if (selectedFloor === null) return;
    try {
      setSaving(true);
      await deleteBlueprint(selectedFloor);
      setFloorPlan((prev) => (prev ? { ...prev, blueprintUrl: null } : prev));
      setSaveMessage('도면이 삭제되었습니다.');
    } catch (e) {
      console.error(e);
      setSaveMessage('도면 삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [selectedFloor]);

  const addAnnotation = useCallback((annotation: FloorAnnotation) => {
    setFloorPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, annotations: [...prev.annotations, annotation] };
    });
    setFpDirty(true);
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<FloorAnnotation>) => {
    setFloorPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        annotations: prev.annotations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      };
    });
    setFpDirty(true);
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setFloorPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, annotations: prev.annotations.filter((a) => a.id !== id) };
    });
    setFpDirty(true);
  }, []);

  return {
    blocks,
    floors,
    selectedFloor,
    setSelectedFloor,
    updateBlockPosition,
    updateBlockSize,
    saveLayout,
    loading,
    saving,
    dirty: dirty || fpDirty, // 둘 중 하나라도 더티면 저장 버튼 활성화
    saveAll,
    saveMessage,
    floorPlan,
    updateBlueprintOpacity,
    handleUploadBlueprint,
    handleDeleteBlueprint,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
  };
}
