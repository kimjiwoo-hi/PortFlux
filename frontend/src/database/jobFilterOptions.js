/**
 * 채용공고 상세 조건 필터 옵션
 *
 * industries: 업종 분류
 * companyTypes: 기업 형태
 * workTypes: 근무 형태
 * workDays: 근무 요일
 * salaryRanges: 연봉 범위 옵션
 */

export const industries = [
  "서비스업",
  "IT·웹·통신",
  "제조·생산",
  "유통·무역",
  "교육",
  "건설",
  "의료·제약",
  "금융·보험",
  "미디어·광고",
  "엔터테인먼트",
  "공공·복지",
];

export const companyTypes = [
  "대기업",
  "중견기업",
  "중소기업",
  "스타트업",
  "외국계(법인/투자)",
  "코스닥",
  "코스피",
  "벤처기업",
];

export const workTypes = [
  "정규직",
  "계약직",
  "인턴",
  "아르바이트",
  "프리랜서",
  "파견직",
  "일용직",
];

export const workDays = [
  "주 5일(월~금)",
  "주 6일",
  "격주 휴무",
  "유연근무",
  "시간선택제",
  "재택근무",
];

export const salaryRanges = [
  { id: "all", label: "전체", min: null, max: null },
  { id: "2000", label: "2천만원 이상", min: 2000, max: null },
  { id: "3000", label: "3천만원 이상", min: 3000, max: null },
  { id: "4000", label: "4천만원 이상", min: 4000, max: null },
  { id: "5000", label: "5천만원 이상", min: 5000, max: null },
  { id: "6000", label: "6천만원 이상", min: 6000, max: null },
  { id: "7000", label: "7천만원 이상", min: 7000, max: null },
  { id: "8000", label: "8천만원 이상", min: 8000, max: null },
  { id: "10000", label: "1억원 이상", min: 10000, max: null },
];

/**
 * 연봉 범위 라벨 찾기
 * @param {string} id - 연봉 범위 ID
 * @returns {string} 연봉 범위 라벨
 */
export const getSalaryRangeLabel = (id) => {
  const range = salaryRanges.find((r) => r.id === id);
  return range ? range.label : "전체";
};

/**
 * 연봉 범위 값 가져오기
 * @param {string} id - 연봉 범위 ID
 * @returns {object} { min, max }
 */
export const getSalaryRangeValue = (id) => {
  const range = salaryRanges.find((r) => r.id === id);
  return range ? { min: range.min, max: range.max } : { min: null, max: null };
};

export default {
  industries,
  companyTypes,
  workTypes,
  workDays,
  salaryRanges,
  getSalaryRangeLabel,
  getSalaryRangeValue,
};
