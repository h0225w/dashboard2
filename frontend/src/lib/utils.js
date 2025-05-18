import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 여러 클래스명을 병합하는 유틸리티 함수
 * @param {string[]} inputs 병합할 클래스명들
 * @returns {string} 병합된 클래스명
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * 숫자를 한국 원화 형식으로 포맷하는 함수
 * @param {number} number 포맷할 숫자
 * @returns {string} 원화 형식 문자열
 */
export function formatCurrency(number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(number);
}

/**
 * 숫자를 천 단위로 쉼표 포맷팅
 * @param {number} number 포맷할 숫자
 * @returns {string} 천 단위 쉼표 포맷팅된 문자열
 */
export function formatNumber(number, decimals = 0) {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * 퍼센트 형식으로 포맷팅
 * @param {number} number 포맷할 숫자 (0.xx 형식)
 * @returns {string} 퍼센트 포맷팅된 문자열
 */
export function formatPercent(number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(number);
}

/**
 * 날짜를 yyyy-MM-dd 형식으로 포맷팅
 * @param {string|Date} date 포맷할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date, format = 'yyyy-MM-dd') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * 데이터를 그룹화하는 함수
 * @param {Array} array 그룹화할 배열
 * @param {Function} keyFunction 키를 생성하는 함수
 * @returns {Object} 그룹화된 객체
 */
export function groupBy(array, keyFunction) {
  return array.reduce((result, item) => {
    const key = keyFunction(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

/**
 * 두 날짜 사이의 일 수 차이를 계산하는 유틸리티 함수
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {number} - 일 수 차이
 */
export function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
} 