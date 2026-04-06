"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDeviceTypes, createDeviceType, updateDeviceType, deleteDeviceType } from "../_api";
import type { DeviceType, SaveDeviceTypeRequest } from "../_types";
import { ApiError } from "@/lib/api";

const UI_TYPE_OPTIONS = [
  { value: "toggle", label: "토글 (ON/OFF)" },
  { value: "slider", label: "슬라이더 (밝기/온도)" },
  { value: "button", label: "버튼 (시작/정지)" },
];

const EMPTY_FORM: SaveDeviceTypeRequest = {
  code: "",
  name: "",
  commands: "[]",
  uiType: "toggle",
};

export function DeviceTypeManager() {
  const [types, setTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SaveDeviceTypeRequest>(EMPTY_FORM);
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
      commands: type.commands,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setError("코드와 이름은 필수입니다");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await updateDeviceType(editingId, { ...form, code: form.code.toUpperCase() });
        setSuccess("기기 종류가 수정되었습니다");
      } else {
        await createDeviceType({ ...form, code: form.code.toUpperCase() });
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
            className="overflow-hidden rounded-xl border border-border bg-surface p-5 space-y-4"
          >
            <p className="text-sm font-bold text-primary">
              {editingId ? "기기 종류 수정" : "새 기기 종류 등록"}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="dt-code" className="text-xs font-semibold text-primary">
                  코드 <span className="text-destructive">*</span>
                </label>
                <input
                  id="dt-code"
                  type="text"
                  placeholder="예: DOOR_LOCK"
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
                  placeholder="예: 도어락"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm
                    text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dt-ui" className="text-xs font-semibold text-primary">
                  UI 타입
                </label>
                <select
                  id="dt-ui"
                  value={form.uiType}
                  onChange={(e) => setForm({ ...form, uiType: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm
                    text-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {UI_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="dt-commands" className="text-xs font-semibold text-primary">
                  명령어 (JSON)
                </label>
                <input
                  id="dt-commands"
                  type="text"
                  placeholder='예: ["ON","OFF"]'
                  value={form.commands}
                  onChange={(e) => setForm({ ...form, commands: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono
                    text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
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
          {types.map((type, idx) => (
            <motion.div
              key={type.deviceTypeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-3
                transition-colors hover:border-secondary"
            >
              <div className="flex items-center gap-4">
                <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
                  {type.code}
                </span>
                <span className="text-sm font-semibold text-primary">{type.name}</span>
                <span className="text-xs text-muted-foreground">{type.uiType}</span>
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
