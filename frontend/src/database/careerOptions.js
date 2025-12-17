/**
 * 경력 옵션 데이터
 */
export const careerTypes = [
  { value: "신입", label: "신입" },
  { value: "경력", label: "경력" },
  { value: "경력무관", label: "경력무관" },
];

export const careerYears = [
  { value: "1년", label: "1년" },
  { value: "2년", label: "2년" },
  { value: "3년", label: "3년" },
  { value: "4년", label: "4년" },
  { value: "5년", label: "5년" },
  { value: "6년", label: "6년" },
  { value: "7년", label: "7년" },
  { value: "8년", label: "8년" },
  { value: "9년", label: "9년" },
  { value: "10년 이상", label: "10년 이상" },
];

export const getCareerTypeLabel = (value) => {
  const type = careerTypes.find((t) => t.value === value);
  return type ? type.label : value;
};

export const formatCareerType = (types) => {
  if (!types || types.length === 0) return "경력무관";
  return types.map((t) => getCareerTypeLabel(t)).join(", ");
};

export default { careerTypes, careerYears };
