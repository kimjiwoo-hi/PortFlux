/**
 * 채용공고 필터 옵션 데이터
 */

// 업종
export const industries = [
  { value: "IT·웹·통신", label: "IT·웹·통신" },
  { value: "미디어·광고", label: "미디어·광고" },
  { value: "금융·은행", label: "금융·은행" },
  { value: "제조·생산", label: "제조·생산" },
  { value: "유통·무역", label: "유통·무역" },
  { value: "건설·건축", label: "건설·건축" },
  { value: "의료·제약", label: "의료·제약" },
  { value: "교육·학원", label: "교육·학원" },
  { value: "서비스업", label: "서비스업" },
  { value: "외식·식품", label: "외식·식품" },
  { value: "물류·운송", label: "물류·운송" },
  { value: "기타", label: "기타" },
];

// 기업형태
export const companyTypes = [
  { value: "대기업", label: "대기업" },
  { value: "중견기업", label: "중견기업" },
  { value: "중소기업", label: "중소기업" },
  { value: "스타트업", label: "스타트업" },
  { value: "외국계", label: "외국계" },
  { value: "공기업", label: "공기업" },
  { value: "비영리단체", label: "비영리단체" },
  { value: "기타", label: "기타" },
];

// 근무형태
export const workTypes = [
  { value: "정규직", label: "정규직" },
  { value: "계약직", label: "계약직" },
  { value: "인턴", label: "인턴" },
  { value: "파견직", label: "파견직" },
  { value: "아르바이트", label: "아르바이트" },
  { value: "프리랜서", label: "프리랜서" },
  { value: "기타", label: "기타" },
];

// 근무요일
export const workDays = [
  { value: "주 5일(월~금)", label: "주 5일(월~금)" },
  { value: "주 6일", label: "주 6일" },
  { value: "주말근무", label: "주말근무" },
  { value: "격주근무", label: "격주근무" },
  { value: "탄력근무", label: "탄력근무" },
  { value: "재택근무", label: "재택근무" },
  { value: "기타", label: "기타" },
];

// 급여 범위 (필터용)
export const salaryRanges = [
  { value: "", label: "전체" },
  { value: "2000", label: "2,000만원 이상" },
  { value: "3000", label: "3,000만원 이상" },
  { value: "4000", label: "4,000만원 이상" },
  { value: "5000", label: "5,000만원 이상" },
  { value: "6000", label: "6,000만원 이상" },
  { value: "8000", label: "8,000만원 이상" },
  { value: "10000", label: "1억원 이상" },
];

// 정렬 옵션
export const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회순" },
  { value: "deadline", label: "마감임박순" },
];

// 공고 상태
export const jobStatuses = [
  { value: "ACTIVE", label: "채용중" },
  { value: "CLOSED", label: "마감" },
  { value: "EXPIRED", label: "만료" },
];

export const getJobStatusLabel = (value) => {
  const item = jobStatuses.find((s) => s.value === value);
  return item ? item.label : value;
};

export const formatSalary = (min, max) => {
  if (!min && !max) return "회사내규에 따름";
  if (min && max) {
    return `${min.toLocaleString()}만원 ~ ${max.toLocaleString()}만원`;
  }
  if (min) return `${min.toLocaleString()}만원 이상`;
  if (max) return `${max.toLocaleString()}만원 이하`;
  return "회사내규에 따름";
};

export default {
  industries,
  companyTypes,
  workTypes,
  workDays,
  salaryRanges,
  sortOptions,
  jobStatuses,
};
