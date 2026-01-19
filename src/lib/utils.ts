import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 엑셀 시리얼 날짜(43647.29861 등)를 JS Date 객체로 변환합니다.
 */
export function excelSerialDateToJSDate(serial: number): Date | null {
  if (typeof serial !== 'number' || isNaN(serial)) {
    return null;
  }
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds
  );
}

/**
 * 다양한 형식의 사고 일시 데이터를 Date 객체로 파싱합니다.
 * - Excel Serial: "43647.29861"
 * - Dot format: "2024.01.18"
 * - Standard string: "2024-01-18"
 */
export function parseIncidentDate(dateValue: string | number): Date | null {
  if (!dateValue) return null;

  // 숫자인 경우 (Excel Serial)
  if (typeof dateValue === 'number') {
    return excelSerialDateToJSDate(dateValue);
  }

  // 문자열인 경우
  if (typeof dateValue === 'string') {
    // 1. 숫자로만 이루어진 경우 (Excel Serial string)
    if (!isNaN(Number(dateValue)) && dateValue.includes('.')) {
      const serial = parseFloat(dateValue);
      if (serial > 30000 && serial < 60000) { // 적절한 엑셀 날짜 범위 확인
        return excelSerialDateToJSDate(serial);
      }
    }

    // 2. 일반적인 날짜 문자열 파싱
    try {
      // 2024.01.18 -> 2024-01-18 변환
      const normalizedDate = dateValue.replace(/\./g, '-').replace(/-$/, '');
      const date = new Date(normalizedDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      return null;
    }
  }

  return null;
}