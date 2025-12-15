/**
 * 채용공고 학력 선택 옵션
 *
 * educationLevels: 학력 수준별 옵션 (ID와 라벨)
 * - id: DB에 저장되는 값 (POST.job_education)
 * - label: 화면에 표시되는 텍스트
 */

export const educationLevels = [
  {
    id: "high_below",
    label: "고교 졸업 이하",
  },
  {
    id: "high",
    label: "고등학교 졸업",
  },
  {
    id: "college_2_3",
    label: "대학 졸업(2,3년제)",
  },
  {
    id: "university",
    label: "대학교 졸업(4년제)",
  },
  {
    id: "master",
    label: "대학원 석사 졸업",
  },
  {
    id: "doctor",
    label: "대학원 박사 졸업",
  },
  {
    id: "doctor_above",
    label: "박사 졸업 이상",
  },
];

/**
 * 학력 ID로 라벨 찾기
 * @param {string} id - 학력 ID
 * @returns {string} 학력 라벨
 */
export const getEducationLabel = (id) => {
  const level = educationLevels.find((level) => level.id === id);
  return level ? level.label : "학력무관";
};

export default {
  educationLevels,
  getEducationLabel,
};
