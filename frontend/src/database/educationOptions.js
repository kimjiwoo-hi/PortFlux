/**
 * 학력 옵션 데이터
 */
export const educationLevels = [
  { value: "high_below", label: "고졸 미만" },
  { value: "high", label: "고졸" },
  { value: "college_2_3", label: "대학(2,3년제)" },
  { value: "university", label: "대학교(4년제)" },
  { value: "master", label: "석사" },
  { value: "doctor", label: "박사" },
  { value: "doctor_above", label: "박사 이상" },
];

export const getEducationLabel = (value) => {
  if (!value) return "학력무관";
  const level = educationLevels.find((l) => l.value === value);
  return level ? level.label : value;
};

export const formatEducation = (education, educationExclude) => {
  if (educationExclude === true || educationExclude === "Y") {
    return "학력무관";
  }
  return getEducationLabel(education);
};

export default { educationLevels };
