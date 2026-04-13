"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDeviceTypes, createDeviceType, updateDeviceType, deleteDeviceType } from "../_api";
import type { DeviceType, DeviceCommand, SaveDeviceTypeRequest } from "../_types";
import { ApiError } from "@/lib/api";

/** 명령 추가 드롭다운 (토글 제외 — 토글은 전용 버튼으로 쌍 추가) */
const UI_TYPE_OPTIONS = [
  { value: "slider", label: "슬라이더 — 수치 조절" },
  { value: "select", label: "선택 — 드롭다운 목록" },
  { value: "button", label: "버튼 — 개별 동작 실행" },
];

const EMPTY_COMMAND: DeviceCommand = {
  command: "",
  uiType: "slider",
  stateKey: "",
  label: "",
};

interface DeviceTypeForm {
  code: string;
  name: string;
  commands: DeviceCommand[];
  uiType: string;
}

const EMPTY_FORM: DeviceTypeForm = {
  code: "",
  name: "",
  commands: [],
  uiType: "toggle",
};

/** commands JSON 문자열 → DeviceCommand[] 파싱 (하위호환 포함) */
function parseCommands(raw: string): DeviceCommand[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // 새 포맷: [{command, uiType, stateKey, ...}]
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].command) {
        return parsed as DeviceCommand[];
      }
      // 레거시 포맷: ["ON","OFF"]
      return parsed.map((cmd: string) => ({
        command: cmd,
        uiType: "toggle" as const,
        stateKey: "power",
        label: cmd,
      }));
    }
    // 레거시 오브젝트 포맷: {"ON":{},"OFF":{}}
    if (typeof parsed === "object") {
      return Object.keys(parsed).map((key) => ({
        command: key,
        uiType: "toggle" as const,
        stateKey: "power",
        label: key,
      }));
    }
  } catch {
    // 파싱 실패
  }
  return [];
}

export function DeviceTypeManager() {
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<DeviceTypeForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDeviceTypes();
      setTypes(res.data ?? []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (type: DeviceType) => {
    setForm({
      code: type.code,
      name: type.name,
      commands: parseCommands(type.commands),
      uiType: type.uiType,
    });
    setEditingId(type.deviceTypeId);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (type: DeviceType) => {
    if (!confirm(`"${type.name}" 기기 종류를 삭제하시겠습니까?`)) return;

    try {
      await deleteDeviceType(type.deviceTypeId);
      setSuccess(`"${type.name}" 종류가 삭제되었습니다`);
      loadTypes();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("삭제에 실패했습니다");
    }
  };

  // ── 명령어 동적 추가/삭제/수정 ──

  /** 토글 쌍 추가 (ON/OFF 2개를 한 번에) */
  const addTogglePair = () => {
    setForm((prev) => ({
      ...prev,
      commands: [
        ...prev.commands,
        { command: "", uiType: "toggle" as const, stateKey: "", label: "", stateValue: true },
        { command: "", uiType: "toggle" as const, stateKey: "", label: "", stateValue: false },
      ],
    }));
  };

  /** 개별 명령 추가 (slider / select / button) */
  const addCommand = () => {
    setForm((prev) => ({
      ...prev,
      commands: [...prev.commands, { ...EMPTY_COMMAND }],
    }));
  };

  /** 명령 삭제. 토글은 쌍으로 삭제 */
  const removeCommand = (index: number) => {
    const cmd = form.commands[index];
    if (cmd.uiType === "toggle") {
      // 같은 stateKey를 가진 토글 쌍을 함께 삭제
      const pairKey = cmd.stateKey;
      setForm((prev) => ({
        ...prev,
        commands: prev.commands.filter((c, i) => {
          if (c.uiType === "toggle" && c.stateKey === pairKey && pairKey) return false;
          return i !== index;
        }),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        commands: prev.commands.filter((_, i) => i !== index),
      }));
    }
  };

  const updateCommand = (index: number, field: keyof DeviceCommand, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd, i) =>
        i === index ? { ...cmd, [field]: value } : cmd
      ),
    }));
  };

  /** 토글 쌍의 공유 필드(label, stateKey) 변경 시 두 명령어 동시 업데이트 */
  const updateTogglePairShared = (pairIndices: number[], field: "label" | "stateKey", value: string) => {
    setForm((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd, i) =>
        pairIndices.includes(i) ? { ...cmd, [field]: value } : cmd
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setError("코드와 이름은 필수입니다");
      return;
    }
    // 명령어가 있을 경우만 필드 검증 (명령어 없이 등록 가능 — 기기 등록 시 IoT 서버에서 자동 병합)
    for (const cmd of form.commands) {
      if (!cmd.command.trim() || !cmd.stateKey.trim() || !cmd.label.trim()) {
        setError("추가된 명령어의 명령어명, 상태 키, 라벨은 필수입니다");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    // DeviceCommand[] → JSON 문자열로 직렬화
    const payload: SaveDeviceTypeRequest = {
      code: form.code.toUpperCase(),
      name: form.name,
      commands: JSON.stringify(form.commands),
      uiType: form.commands[0]?.uiType ?? "toggle",
    };

    try {
      if (editingId) {
        await updateDeviceType(editingId, payload);
        setSuccess("기기 종류가 수정되었습니다");
      } else {
        await createDeviceType(payload);
        setSuccess("기기 종류가 등록되었습니다");
      }
      resetForm();
      loadTypes();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("저장에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 & 등록 버튼 */}
      <div className="flex items-center justify-between">
        <p className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Device Types
        </p>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setSuccess(null); }}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]
              text-primary-foreground transition-colors hover:bg-secondary"
          >
            + 종류 추가
          </motion.button>
        )}
      </div>

      {/* 알림 메시지 */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-secondary/40 bg-surface px-4 py-3 text-sm font-medium text-primary"
          >
            ✅ {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 등록/수정 폼 */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-border bg-surface p-5 space-y-5"
          >
            <p className="text-sm font-bold text-primary">
              {editingId ? "기기 종류 수정" : "새 기기 종류 등록"}
            </p>

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="dt-code" className="text-xs font-semibold text-primary">
                  코드 <span className="text-destructive">*</span>
                </label>
                <input
                  id="dt-code"
                  type="text"
                  placeholder="ex: AIR_CONDITIONER"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono
                    text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dt-name" className="text-xs font-semibold text-primary">
                  이름 <span className="text-destructive">*</span>
                </label>
                <input
                  id="dt-name"
                  type="text"
                  placeholder="ex: 에어컨"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm
                    text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>

            {/* 명령어 목록 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  명령어 목록
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addTogglePair}
                    className="rounded-lg bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-bold text-accent
                      transition-colors hover:bg-accent/20"
                  >
                    + 토글 추가
                  </button>
                  <button
                    type="button"
                    onClick={addCommand}
                    className="rounded-lg bg-muted px-3 py-1 text-xs font-bold text-primary
                      transition-colors hover:bg-secondary/30"
                  >
                    + 명령 추가
                  </button>
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                <p className="font-bold text-primary mb-1">💡 명령어 등록 가이드</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><strong>선택 사항</strong>: 명령어 없이도 기기 종류를 등록할 수 있습니다. 기기 등록 시 IoT 서버에서 자동으로 병합됩니다.</li>
                  <li><strong>토글</strong>: ON/OFF 쌍으로 등록되며, 하나의 스위치로 표시됩니다. (같은 상태 키를 자동 공유)</li>
                  <li><strong>명령</strong>: 슬라이더/선택/버튼 등 개별 제어를 추가합니다.</li>
                  <li><strong>상태 키</strong>가 같은 명령어끼리 하나의 제어로 묶입니다.</li>
                </ul>
              </div>

              {form.commands.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  명령어가 없습니다. 기기 등록 시 IoT 서버에서 자동 병합되거나, 직접 추가할 수 있습니다.
                </p>
              )}

              {(() => {
                const rendered = new Set<number>();
                return form.commands.map((cmd, idx) => {
                  if (rendered.has(idx)) return null;

                  // ── 토글 쌍 통합 카드 ──
                  if (cmd.uiType === "toggle") {
                    const pairIdx = form.commands.findIndex(
                      (c, i) => i !== idx && c.uiType === "toggle" && !rendered.has(i)
                        && ((c.stateKey === cmd.stateKey && cmd.stateKey) || (!c.stateKey && !cmd.stateKey))
                    );
                    if (pairIdx >= 0) {
                      rendered.add(idx);
                      rendered.add(pairIdx);
                      const onIdx = cmd.stateValue === true || cmd.stateValue === "true" || cmd.stateValue === "ON" ? idx : pairIdx;
                      const offIdx = onIdx === idx ? pairIdx : idx;
                      const onCmd = form.commands[onIdx];
                      const offCmd = form.commands[offIdx];
                      const parseStateVal = (v: string) => {
                        if (v === "true") return true;
                        if (v === "false") return false;
                        if (!isNaN(Number(v)) && v.trim() !== "") return Number(v);
                        return v;
                      };

                      return (
                        <motion.div
                          key={`toggle-${idx}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-4 border-l-4 border-l-accent"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                                토글
                              </span>
                              <p className="text-xs font-bold text-muted-foreground">스위치 제어</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCommand(idx)}
                              className="rounded-lg px-2 py-0.5 text-xs font-bold text-destructive
                                transition-colors hover:bg-destructive/10"
                            >
                              ✕ 삭제
                            </button>
                          </div>

                          {/* 공유 필드: 이름 + 상태 키 */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                이름 <span className="text-destructive">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="ex: 전원, 잠금, 동작"
                                value={onCmd.label}
                                onChange={(e) => updateTogglePairShared([onIdx, offIdx], "label", e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm
                                  text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                              />
                              <p className="text-[9px] text-muted-foreground/60">스위치 옆에 표시되는 이름</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                상태 키 <span className="text-destructive">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="ex: power, locked"
                                value={onCmd.stateKey}
                                onChange={(e) => updateTogglePairShared([onIdx, offIdx], "stateKey", e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                  text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                              />
                              <p className="text-[9px] text-muted-foreground/60">같은 키 = 하나의 제어로 묶임</p>
                            </div>
                          </div>

                          {/* ON/OFF 양쪽 */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-accent/20 bg-background p-3 space-y-2">
                              <p className="text-[10px] font-bold text-accent uppercase tracking-wider">스위치 ON일 때</p>
                              <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-muted-foreground">명령어</label>
                                <input
                                  type="text"
                                  placeholder="ex: ON, UNLOCK"
                                  value={onCmd.command}
                                  onChange={(e) => updateCommand(onIdx, "command", e.target.value.toUpperCase())}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                    text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-muted-foreground">상태 값</label>
                                <input
                                  type="text"
                                  placeholder="ex: true"
                                  value={onCmd.stateValue != null ? String(onCmd.stateValue) : ""}
                                  onChange={(e) => updateCommand(onIdx, "stateValue", parseStateVal(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                    text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                                />
                              </div>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">스위치 OFF일 때</p>
                              <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-muted-foreground">명령어</label>
                                <input
                                  type="text"
                                  placeholder="ex: OFF, LOCK"
                                  value={offCmd.command}
                                  onChange={(e) => updateCommand(offIdx, "command", e.target.value.toUpperCase())}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                    text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-muted-foreground">상태 값</label>
                                <input
                                  type="text"
                                  placeholder="ex: false"
                                  value={offCmd.stateValue != null ? String(offCmd.stateValue) : ""}
                                  onChange={(e) => updateCommand(offIdx, "stateValue", parseStateVal(e.target.value))}
                                  className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                    text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                    // 홀수 토글 (쌍 없음) — fallback
                    rendered.add(idx);
                  }

                  // ── 개별 명령 카드 (slider / select / button) ──
                  rendered.add(idx);
                  // stateKey 기반 그룹 색상
                  const nonToggleCmds = form.commands.filter((c) => c.uiType !== "toggle");
                  const stateKeys = [...new Set(nonToggleCmds.map((c) => c.stateKey).filter(Boolean))];
                  const colorIndex = cmd.stateKey ? stateKeys.indexOf(cmd.stateKey) : -1;
                  const groupColors = [
                    "border-l-blue-500", "border-l-amber-500", "border-l-rose-500",
                    "border-l-violet-500", "border-l-cyan-500", "border-l-emerald-500",
                  ];
                  const groupColor = colorIndex >= 0 ? groupColors[colorIndex % groupColors.length] : "border-l-border";
                  const sameKeyCount = nonToggleCmds.filter((c) => c.stateKey && c.stateKey === cmd.stateKey).length;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border border-border bg-background p-4 space-y-3 border-l-4 ${groupColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-muted-foreground">명령</p>
                          {cmd.stateKey && sameKeyCount > 1 && (
                            <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[9px] font-mono font-bold text-muted-foreground">
                              {cmd.stateKey} 그룹
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCommand(idx)}
                          className="rounded-lg px-2 py-0.5 text-xs font-bold text-destructive
                            transition-colors hover:bg-destructive/10"
                        >
                          ✕ 삭제
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            명령어 <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ex: SET_TEMP, RESTART"
                            value={cmd.command}
                            onChange={(e) => updateCommand(idx, "command", e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                              text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                          />
                          <p className="text-[9px] text-muted-foreground/60">IoT 기기에 전송되는 명령 코드</p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            라벨 <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ex: 온도 설정, 재시작"
                            value={cmd.label}
                            onChange={(e) => updateCommand(idx, "label", e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm
                              text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                          />
                          <p className="text-[9px] text-muted-foreground/60">사용자 화면에 표시되는 이름</p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            UI 타입
                          </label>
                          <select
                            value={cmd.uiType}
                            onChange={(e) => updateCommand(idx, "uiType", e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm
                              text-primary focus:outline-none focus:ring-1 focus:ring-ring/40"
                          >
                            {UI_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            상태 키 <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="ex: temperature, mode"
                            value={cmd.stateKey}
                            onChange={(e) => updateCommand(idx, "stateKey", e.target.value)}
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                              text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                          />
                          <p className="text-[9px] text-muted-foreground/60">같은 키 = 하나의 제어로 묶임</p>
                        </div>
                      </div>

                      {/* UI 타입별 추가 필드 */}
                      {cmd.uiType === "button" && (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">상태 값</label>
                            <input
                              type="text"
                              placeholder='ex: START 또는 true'
                              value={cmd.stateValue != null ? String(cmd.stateValue) : ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === "true") updateCommand(idx, "stateValue", true);
                                else if (v === "false") updateCommand(idx, "stateValue", false);
                                else if (!isNaN(Number(v)) && v.trim() !== "") updateCommand(idx, "stateValue", Number(v));
                                else updateCommand(idx, "stateValue", v);
                              }}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                            />
                            <p className="text-[9px] text-muted-foreground/60">명령 실행 시 상태 키에 저장되는 값</p>
                          </div>
                        </div>
                      )}

                      {cmd.uiType === "slider" && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">최소</label>
                            <input
                              type="number"
                              placeholder="ex: 0"
                              value={cmd.min ?? ""}
                              onChange={(e) => updateCommand(idx, "min", e.target.value ? Number(e.target.value) : undefined)}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                text-primary focus:outline-none focus:ring-1 focus:ring-ring/40"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">최대</label>
                            <input
                              type="number"
                              placeholder="ex: 100"
                              value={cmd.max ?? ""}
                              onChange={(e) => updateCommand(idx, "max", e.target.value ? Number(e.target.value) : undefined)}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                                text-primary focus:outline-none focus:ring-1 focus:ring-ring/40"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">단위</label>
                            <input
                              type="text"
                              placeholder="ex: ℃, %"
                              value={cmd.unit ?? ""}
                              onChange={(e) => updateCommand(idx, "unit", e.target.value)}
                              className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm
                                text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                            />
                          </div>
                        </div>
                      )}

                      {cmd.uiType === "select" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">옵션 (쉴표 구분)</label>
                          <input
                            type="text"
                            placeholder="ex: COOL, HEAT, DRY, FAN"
                            defaultValue={cmd.options?.join(", ") ?? ""}
                            onBlur={(e) =>
                              updateCommand(idx, "options", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-mono
                              text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/40"
                          />
                          <p className="text-[9px] text-muted-foreground/60">쉴표(,)로 구분. 입력 후 바깥을 클릭하면 적용.</p>
                        </div>
                      )}
                    </motion.div>
                  );
                });
              })()}
            </div>

            <div className="flex gap-3">
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold uppercase tracking-[0.2em]
                  text-primary-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {submitting ? "저장 중..." : editingId ? "수정" : "등록"}
              </motion.button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-border px-5 py-2 text-xs font-bold uppercase tracking-[0.2em]
                  text-primary transition-colors hover:bg-muted"
              >
                취소
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            등록된 기기 종류가 없습니다. 종류를 추가해 보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {types.map((type, idx) => {
            const cmds = parseCommands(type.commands);
            return (
              <motion.div
                key={type.deviceTypeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-border bg-surface px-5 py-3
                  transition-colors hover:border-secondary"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
                      {type.code}
                    </span>
                    <span className="text-sm font-semibold text-primary">{type.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {cmds.length}개 명령
                    </span>
                    {type.isSystemDefault && (
                      <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        기본
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="rounded-lg border border-border px-3 py-1 text-xs font-semibold
                        text-primary transition-colors hover:bg-muted"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      className="rounded-lg border border-destructive/30 px-3 py-1 text-xs font-semibold
                        text-destructive transition-colors hover:bg-destructive/10"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                {/* 명령어 미리보기 */}
                {cmds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cmds.map((cmd, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        <span className="font-mono font-bold">{cmd.command}</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span>{cmd.label}</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="italic">{cmd.uiType}</span>
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
