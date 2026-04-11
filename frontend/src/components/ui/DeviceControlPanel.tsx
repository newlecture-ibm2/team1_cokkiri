"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * 구조화된 명령어 정의.
 * device_types.commands JSONB 내부 구조와 동일.
 */
export interface DeviceCommand {
  command: string;
  uiType: "toggle" | "slider" | "select" | "button";
  stateKey: string;
  label: string;
  stateValue?: unknown;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
}

interface DeviceControlPanelProps {
  /** device_types.commands JSON 문자열 */
  commandsJson: string;
  /** devices.current_state JSON 문자열 */
  currentStateJson: string;
  /** 제어 가능 여부 */
  disabled?: boolean;
  /** 제어 실행 콜백. command + params 를 전달 */
  onControl: (command: string, params: Record<string, unknown>) => Promise<void>;
  /** Optimistic UI 콜백 — 제어 성공 시 새 current_state를 부모에 전달 */
  onStateChange?: (newState: Record<string, unknown>) => void;
}

/** commands JSON → DeviceCommand[] 변환 (레거시 호환 포함) */
export function parseCommands(raw: string): DeviceCommand[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].command) {
        return parsed as DeviceCommand[];
      }
      // 레거시: ["ON","OFF"]
      return parsed.map((cmd: string) => ({
        command: cmd,
        uiType: "toggle" as const,
        stateKey: "power",
        label: cmd,
      }));
    }
    if (typeof parsed === "object") {
      // 레거시: {"ON":{},"OFF":{}}
      return Object.keys(parsed).map((key) => ({
        command: key,
        uiType: "toggle" as const,
        stateKey: "power",
        label: key,
      }));
    }
  } catch { /* ignore */ }
  return [];
}

/** 토글 쌍 찾기: 같은 stateKey를 공유하는 toggle 명령 2개를 쌍으로 묶음 */
function groupTogglePairs(commands: DeviceCommand[]): {
  togglePairs: [DeviceCommand, DeviceCommand][];
  others: DeviceCommand[];
} {
  const toggles = commands.filter((c) => c.uiType === "toggle");
  const others = commands.filter((c) => c.uiType !== "toggle");

  const keyMap = new Map<string, DeviceCommand[]>();
  for (const cmd of toggles) {
    const arr = keyMap.get(cmd.stateKey) ?? [];
    arr.push(cmd);
    keyMap.set(cmd.stateKey, arr);
  }

  const togglePairs: [DeviceCommand, DeviceCommand][] = [];
  for (const [, cmds] of keyMap) {
    if (cmds.length === 2) {
      togglePairs.push([cmds[0], cmds[1]]);
    } else {
      // 쌍이 안 되면 button으로 fallback
      others.push(...cmds);
    }
  }

  return { togglePairs, others };
}

/**
 * commands 기반 동적 기기 제어 패널.
 * toggle, slider, select, button 4가지 uiType을 지원.
 */
export function DeviceControlPanel({
  commandsJson,
  currentStateJson,
  disabled = false,
  onControl,
  onStateChange,
}: DeviceControlPanelProps) {
  const commands = parseCommands(commandsJson);
  const [busy, setBusy] = useState(false);

  let currentState: Record<string, unknown> = {};
  try {
    currentState = JSON.parse(currentStateJson || "{}");
  } catch { /* ignore */ }

  const { togglePairs, others } = groupTogglePairs(commands);

  const executeControl = useCallback(
    async (command: string, params: Record<string, unknown>) => {
      if (disabled || busy) return;
      setBusy(true);
      try {
        await onControl(command, params);
        // Optimistic: merge
        const newState = { ...currentState, ...params };
        onStateChange?.(newState);
      } finally {
        setBusy(false);
      }
    },
    [disabled, busy, onControl, currentState, onStateChange]
  );

  if (commands.length === 0) {
    return (
      <span className="text-[10px] text-muted-foreground">명령 없음</span>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${busy ? "animate-pulse pointer-events-none" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── 토글 쌍 ── */}
      {togglePairs.map(([onCmd, offCmd]) => {
        // 현재 상태와 비교: 어느 쪽이 활성인지 판별
        const stateVal = currentState[onCmd.stateKey];
        const isOn =
          stateVal === onCmd.stateValue ||
          stateVal === true ||
          stateVal === "ON" ||
          stateVal === onCmd.command;

        return (
          <button
            key={`toggle-${onCmd.stateKey}`}
            disabled={disabled}
            onClick={() => {
              const target = isOn ? offCmd : onCmd;
              const params: Record<string, unknown> = {};
              if (target.stateValue !== undefined) {
                params[target.stateKey] = target.stateValue;
              }
              executeControl(target.command, params);
            }}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold
              transition-all duration-200
              ${isOn
                ? "border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                : "border border-border bg-muted/20 text-muted-foreground hover:bg-muted/30"
              }`}
          >
            <div
              className={`relative h-4 w-7 rounded-full transition-colors duration-200
                ${isOn ? "bg-accent" : "bg-muted/40"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow
                  transition-transform duration-200
                  ${isOn ? "translate-x-3" : "translate-x-0"}`}
              />
            </div>
            <span>{isOn ? onCmd.label : offCmd.label}</span>
          </button>
        );
      })}

      {/* ── 슬라이더 ── */}
      {others
        .filter((cmd) => cmd.uiType === "slider")
        .map((cmd) => {
          const val = Number(currentState[cmd.stateKey] ?? cmd.min ?? 0);
          return (
            <div key={`slider-${cmd.command}`} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                {cmd.label}
              </span>
              <input
                type="range"
                min={cmd.min ?? 0}
                max={cmd.max ?? 100}
                value={val}
                disabled={disabled}
                onChange={(e) => {
                  const newVal = Number(e.target.value);
                  const params = { [cmd.stateKey]: newVal };
                  onStateChange?.({ ...currentState, ...params });
                }}
                onMouseUp={(e) => {
                  const newVal = Number((e.target as HTMLInputElement).value);
                  executeControl(cmd.command, { [cmd.stateKey]: newVal });
                }}
                onTouchEnd={(e) => {
                  const newVal = Number((e.target as HTMLInputElement).value);
                  executeControl(cmd.command, { [cmd.stateKey]: newVal });
                }}
                className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-muted/30
                  accent-accent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
                  [&::-webkit-slider-thumb]:appearance-none"
              />
              <span className="text-[10px] font-mono font-bold text-primary min-w-[2.5rem] text-right">
                {val}{cmd.unit ?? ""}
              </span>
            </div>
          );
        })}

      {/* ── 셀렉트 ── */}
      {others
        .filter((cmd) => cmd.uiType === "select")
        .map((cmd) => {
          const val = String(currentState[cmd.stateKey] ?? "");
          return (
            <div key={`select-${cmd.command}`} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                {cmd.label}
              </span>
              <select
                value={val}
                disabled={disabled}
                onChange={(e) => {
                  executeControl(cmd.command, { [cmd.stateKey]: e.target.value });
                }}
                className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium
                  text-primary focus:outline-none focus:ring-1 focus:ring-ring/40"
              >
                <option value="">선택</option>
                {cmd.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        })}

      {/* ── 버튼 ── */}
      {others
        .filter((cmd) => cmd.uiType === "button")
        .map((cmd) => (
          <motion.button
            key={`btn-${cmd.command}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={disabled}
            onClick={() => {
              const params: Record<string, unknown> = {};
              if (cmd.stateValue !== undefined) {
                params[cmd.stateKey] = cmd.stateValue;
              }
              executeControl(cmd.command, params);
            }}
            className="rounded-xl border border-border bg-muted/10 px-3 py-1.5
              text-xs font-bold text-primary transition-colors hover:bg-muted/20
              disabled:opacity-50"
          >
            {cmd.label}
          </motion.button>
        ))}
    </div>
  );
}
