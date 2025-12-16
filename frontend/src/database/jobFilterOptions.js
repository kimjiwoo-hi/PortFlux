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
  { value: "서비스업", label: "서비스업" },
  { value: "IT·웹·통신", label: "IT·웹·통신" },
  { value: "제조·생산", label: "제조·생산" },
  { value: "유통·무역", label: "유통·무역" },
  { value: "교육", label: "교육" },
  { value: "건설", label: "건설" },
  { value: "의료·제약", label: "의료·제약" },
  { value: "금융·보험", label: "금융·보험" },
  { value: "미디어·광고", label: "미디어·광고" },
  { value: "엔터테인먼트", label: "엔터테인먼트" },
  { value: "공공·복지", label: "공공·복지" },
];

export const companyTypes = [
  { value: "대기업", label: "대기업" },
  { value: "중견기업", label: "중견기업" },
  { value: "중소기업", label: "중소기업" },
  { value: "스타트업", label: "스타트업" },
  { value: "외국계(법인/투자)", label: "외국계(법인/투자)" },
  { value: "코스닥", label: "코스닥" },
  { value: "코스피", label: "코스피" },
  { value: "벤처기업", label: "벤처기업" },
];

export const workTypes = [
  { value: "정규직", label: "정규직" },
  { value: "계약직", label: "계약직" },
  { value: "인턴", label: "인턴" },
  { value: "아르바이트", label: "아르바이트" },
  { value: "프리랜서", label: "프리랜서" },
  { value: "파견직", label: "파견직" },
  { value: "일용직", label: "일용직" },
];

export const workDays = [
  { value: "주 5일(월~금)", label: "주 5일(월~금)" },
  { value: "주 6일", label: "주 6일" },
  { value: "격주 휴무", label: "격주 휴무" },
  { value: "유연근무", label: "유연근무" },
  { value: "시간선택제", label: "시간선택제" },
  { value: "재택근무", label: "재택근무" },
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
