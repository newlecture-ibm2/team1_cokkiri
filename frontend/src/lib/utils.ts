// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui 호환 유틸리티 함수
 * clsx로 조건부 클래스를 결합하고 tailwind-merge로 중복 제거
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
