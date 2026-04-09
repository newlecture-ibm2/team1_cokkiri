"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { createDevice, fetchDeviceTypes, fetchSpaces } from "../_api";
import type { CreateDeviceRequest, DeviceType, Space } from "../_types";
import { ApiError } from "@/lib/api";

interface FieldError {
  [key: string]: string;
}


export function DeviceRegisterForm() {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [form, setForm] = useState<CreateDeviceRequest>({
    spaceId: 0,
    deviceTypeId: 0,
    name: "",
    modelName: "",
    macAddress: "",
    mockEndpoint: "",
  });

  const loadDeviceTypes = useCallback(async () => {
    try {
      const res = await fetchDeviceTypes();
      setDeviceTypes(res.data ?? []);
    } catch {
      // 종류 로드 실패 시 빈 목록
    }
  }, []);

  const loadSpaces = useCallback(async () => {
    try {
      const res = await fetchSpaces();
      // fetchSpaces는 paginated 응답일 수 있으므로 content 배열 추출
      const data = res.data;
      if (Array.isArray(data)) {
        setSpaces(data);
      } else if (data && Array.isArray((data as Record<string, unknown>).content)) {
        setSpaces((data as Record<string, unknown>).content as Space[]);
      }
    } catch {
      // 공간 로드 실패 시 빈 목록
    }
  }, []);

  useEffect(() => {
    loadDeviceTypes();
    loadSpaces();
  }, [loadDeviceTypes, loadSpaces]);

  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 공간 분류 및 정렬 (층 → 이름순)
  const sortSpaces = (list: Space[]) =>
    [...list].sort((a, b) => {
      const floorDiff = (a.floor ?? 0) - (b.floor ?? 0);
      if (floorDiff !== 0) return floorDiff;
      return (a.name ?? "").localeCompare(b.name ?? "", "ko", { numeric: true });
    });
  const privateSpaces = sortSpaces(spaces.filter((s) => s.type === "PRIVATE"));
  const commonSpaces = sortSpaces(spaces.filter((s) => s.type === "COMMON"));

  const validate = (): boolean => {
    const newErrors: FieldError = {};

    if (!form.spaceId || form.spaceId <= 0) {
      newErrors.spaceId = "설치 공간을 선택해 주세요";
    }
    if (!form.deviceTypeId || form.deviceTypeId <= 0) {
      newErrors.deviceTypeId = "기기 종류를 선택해 주세요";
    }
    if (!form.name.trim()) {
      newErrors.name = "기기명은 필수입니다";
    } else if (form.name.length > 100) {
      newErrors.name = "기기명은 100자 이내여야 합니다";
    }
    if (!form.modelName || !form.modelName.trim()) {
      newErrors.modelName = "모델명은 필수입니다";
    } else if (form.modelName.length > 100) {
      newErrors.modelName = "모델명은 100자 이내여야 합니다";
    }
    if (!form.macAddress || !form.macAddress.trim()) {
      newErrors.macAddress = "MAC 주소는 필수입니다";
    } else if (form.macAddress.length > 50) {
      newErrors.macAddress = "MAC 주소는 50자 이내여야 합니다";
    }
    if (form.mockEndpoint && !isValidUrl(form.mockEndpoint)) {
      newErrors.mockEndpoint = "올바른 URL 형식이 아닙니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (field: keyof CreateDeviceRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    setApiError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      await createDevice(form);
      setSuccess(true);
      setForm({
        spaceId: 0,
        deviceTypeId: 0,
        name: "",
        modelName: "",
        macAddress: "",
        mockEndpoint: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        // MAC 주소 중복 에러 → 필드 인라인 에러로 표시
        if (err.errorCode === "DUPLICATE_MAC_ADDRESS") {
          setErrors((prev) => ({ ...prev, macAddress: err.message || "이미 등록된 MAC 주소입니다" }));
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError("기기 등록에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* 성공 메시지 */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-secondary/40 bg-surface px-5 py-4 text-sm font-medium text-primary"
        >
          ✅ 기기가 성공적으로 등록되었습니다.
        </motion.div>
      )}

      {/* API 에러 메시지 */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm font-medium text-destructive"
        >
          {apiError}
        </motion.div>
      )}

      {/* ── 기본 정보 ── */}
      <fieldset className="space-y-6">
        <legend className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          기본 정보
        </legend>

        {/* 기기명 */}
        <div className="space-y-2">
          <label htmlFor="device-name" className="block text-sm font-semibold text-primary">
            기기명 <span className="text-destructive">*</span>
          </label>
          <input
            id="device-name"
            type="text"
            placeholder="예: 1층 라운지 에어컨"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
              bg-surface placeholder:text-muted-foreground/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40
              ${errors.name ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
          />
          {errors.name && <p className="text-xs font-medium text-destructive pl-1">{errors.name}</p>}
        </div>

        {/* 기기 종류 */}
        <div className="space-y-2">
          <label htmlFor="device-type" className="block text-sm font-semibold text-primary">
            기기 종류 <span className="text-destructive">*</span>
          </label>
          <select
            id="device-type"
            value={form.deviceTypeId}
            onChange={(e) => handleChange("deviceTypeId", Number(e.target.value))}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
              bg-surface transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40
              ${errors.deviceTypeId ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
          >
            <option value={0} disabled>종류를 선택하세요</option>
            {deviceTypes.map((dt) => (
              <option key={dt.deviceTypeId} value={dt.deviceTypeId}>
                {dt.name} ({dt.code})
              </option>
            ))}
          </select>
          {errors.deviceTypeId && <p className="text-xs font-medium text-destructive pl-1">{errors.deviceTypeId}</p>}
        </div>

        {/* 모델명 */}
        <div className="space-y-2">
          <label htmlFor="model-name" className="block text-sm font-semibold text-primary">
            모델명 <span className="text-destructive">*</span>
          </label>
          <input
            id="model-name"
            type="text"
            placeholder="예: Samsung AX60R5080WD"
            value={form.modelName}
            onChange={(e) => handleChange("modelName", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
              bg-surface placeholder:text-muted-foreground/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40
              ${errors.modelName ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
          />
          {errors.modelName && <p className="text-xs font-medium text-destructive pl-1">{errors.modelName}</p>}
        </div>
      </fieldset>

      {/* ── 설치 위치 ── */}
      <fieldset className="space-y-6">
        <legend className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          설치 위치
        </legend>

        <div className="space-y-2">
          <label htmlFor="space-select" className="block text-sm font-semibold text-primary">
            설치 공간 <span className="text-destructive">*</span>
          </label>
          <select
            id="space-select"
            value={form.spaceId}
            onChange={(e) => handleChange("spaceId", Number(e.target.value))}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary
              bg-surface transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40
              ${errors.spaceId ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
          >
            <option value={0} disabled>공간을 선택하세요</option>
            {privateSpaces.length > 0 && (
              <optgroup label="🏠 개인 공간 (PRIVATE)">
                {privateSpaces.map((s) => (
                  <option key={s.spaceId} value={s.spaceId}>
                    {s.name} · {s.floor}층 · {s.status === "AVAILABLE" ? "공실" : s.status === "OCCUPIED" ? "입주중" : "정비중"}
                  </option>
                ))}
              </optgroup>
            )}
            {commonSpaces.length > 0 && (
              <optgroup label="🏢 공용 공간 (COMMON)">
                {commonSpaces.map((s) => (
                  <option key={s.spaceId} value={s.spaceId}>
                    {s.name} · {s.floor}층
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {spaces.length === 0 && (
            <p className="text-xs text-muted-foreground pl-1">공간 목록을 불러오는 중...</p>
          )}
          {errors.spaceId && <p className="text-xs font-medium text-destructive pl-1">{errors.spaceId}</p>}
        </div>
      </fieldset>

      {/* ── 네트워크 정보 ── */}
      <fieldset className="space-y-6">
        <legend className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          네트워크 정보
        </legend>

        {/* MAC 주소 */}
        <div className="space-y-2">
          <label htmlFor="mac-address" className="block text-sm font-semibold text-primary">
            MAC 주소 <span className="text-destructive">*</span>
          </label>
          <input
            id="mac-address"
            type="text"
            placeholder="예: AA:BB:CC:DD:EE:FF"
            value={form.macAddress}
            onChange={(e) => handleChange("macAddress", e.target.value.toUpperCase())}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary font-mono
              bg-surface placeholder:text-muted-foreground/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40
              ${errors.macAddress ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
          />
          <p className="text-xs text-muted-foreground pl-1">중복된 MAC 주소는 등록이 불가합니다</p>
          {errors.macAddress && <p className="text-xs font-medium text-destructive pl-1">{errors.macAddress}</p>}
        </div>

        {/* Mock Endpoint */}
        <div className="space-y-2">
          <label htmlFor="mock-endpoint" className="block text-sm font-semibold text-primary">
            모의 엔드포인트 URL
          </label>
          <input
            id="mock-endpoint"
            type="text"
            placeholder="예: http://mock-iot:8000/api/device/1"
            value={form.mockEndpoint}
            onChange={(e) => handleChange("mockEndpoint", e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-primary font-mono
              bg-surface placeholder:text-muted-foreground/50 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring/40
              ${errors.mockEndpoint ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-secondary"}`}
          />
          {errors.mockEndpoint && <p className="text-xs font-medium text-destructive pl-1">{errors.mockEndpoint}</p>}
        </div>
      </fieldset>

      {/* 제출 버튼 */}
      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl bg-primary py-4 text-sm font-bold uppercase tracking-[0.2em]
          text-primary-foreground transition-colors duration-200
          hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "기기 등록"}
      </motion.button>
    </motion.form>
  );
}
