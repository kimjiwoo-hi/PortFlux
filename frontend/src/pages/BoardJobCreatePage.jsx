import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/jobApi";
import { careerTypes, careerYears } from "../database/careerOptions";
import { educationLevels } from "../database/educationOptions";
import {
  industries,
  companyTypes,
  workTypes,
  workDays,
} from "../database/jobFilterOptions";
import "../pages/BoardJobCreatePage.css";

const BoardJobCreatePage = () => {
  const navigate = useNavigate();

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    jobRegion: "",
    jobCareerType: [],
    jobCareerYears: [],
    jobEducation: "",
    jobEducationExclude: false,
    jobSalaryMin: "",
    jobSalaryMax: "",
    jobDeadline: "",
    jobIndustries: [],
    jobCompanyTypes: [],
    jobWorkTypes: [],
    jobWorkDays: [],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 지역 목록 (간단한 예시)
  const regions = [
    "서울",
    "경기",
    "인천",
    "부산",
    "대구",
    "광주",
    "대전",
    "울산",
    "세종",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "jobEducationExclude") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 다중 선택 핸들러
  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [name]: newValues,
      };
    });
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "내용을 입력해주세요.";
    }

    if (!formData.jobRegion) {
      newErrors.jobRegion = "근무지역을 선택해주세요.";
    }

    if (formData.jobCareerType.length === 0) {
      newErrors.jobCareerType = "경력 타입을 선택해주세요.";
    }

    if (!formData.jobEducationExclude && !formData.jobEducation) {
      newErrors.jobEducation = "학력을 선택하거나 학력무관을 체크해주세요.";
    }

    // 급여 검증
    if (formData.jobSalaryMin && formData.jobSalaryMax) {
      if (Number(formData.jobSalaryMin) > Number(formData.jobSalaryMax)) {
        newErrors.salary = "최소 급여가 최대 급여보다 클 수 없습니다.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert("입력 내용을 확인해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      // API 호출용 데이터 준비
      const jobData = {
        ...formData,
        jobSalaryMin: formData.jobSalaryMin
          ? Number(formData.jobSalaryMin)
          : null,
        jobSalaryMax: formData.jobSalaryMax
          ? Number(formData.jobSalaryMax)
          : null,
        jobDeadline: formData.jobDeadline
          ? new Date(formData.jobDeadline).toISOString()
          : null,
      };

      await createJob(jobData);
      alert("채용공고가 등록되었습니다.");
      navigate("/boardjob");
    } catch (error) {
      console.error("채용공고 등록 실패:", error);
      alert(error.response?.data?.message || "채용공고 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까?")) {
      navigate("/boardjob");
    }
  };

  return (
    <div className="job-create-container">
      <div className="job-create-header">
        <h1>채용공고 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="job-create-form">
        {/* 제목 */}
        <div className="form-group">
          <label className="required">제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="채용공고 제목을 입력하세요"
            className={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        {/* 근무지역 */}
        <div className="form-group">
          <label className="required">근무지역</label>
          <select
            name="jobRegion"
            value={formData.jobRegion}
            onChange={handleChange}
            className={errors.jobRegion ? "error" : ""}
          >
            <option value="">선택하세요</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.jobRegion && (
            <span className="error-message">{errors.jobRegion}</span>
          )}
        </div>

        {/* 경력 타입 */}
        <div className="form-group">
          <label className="required">경력</label>
          <div className="checkbox-group">
            {careerTypes.map((type) => (
              <label key={type.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.jobCareerType.includes(type.value)}
                  onChange={() =>
                    handleMultiSelect("jobCareerType", type.value)
                  }
                />
                {type.label}
              </label>
            ))}
          </div>
          {errors.jobCareerType && (
            <span className="error-message">{errors.jobCareerType}</span>
          )}
        </div>

        {/* 경력 연차 */}
        <div className="form-group">
          <label>경력 연차</label>
          <div className="checkbox-group">
            {careerYears.map((year) => (
              <label key={year.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.jobCareerYears.includes(year.value)}
                  onChange={() =>
                    handleMultiSelect("jobCareerYears", year.value)
                  }
                />
                {year.label}
              </label>
            ))}
          </div>
        </div>

        {/* 학력 */}
        <div className="form-group">
          <label className="required">학력</label>
          <div className="education-group">
            <select
              name="jobEducation"
              value={formData.jobEducation}
              onChange={handleChange}
              disabled={formData.jobEducationExclude}
              className={errors.jobEducation ? "error" : ""}
            >
              <option value="">선택하세요</option>
              {educationLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="jobEducationExclude"
                checked={formData.jobEducationExclude}
                onChange={handleChange}
              />
              학력무관
            </label>
          </div>
          {errors.jobEducation && (
            <span className="error-message">{errors.jobEducation}</span>
          )}
        </div>

        {/* 급여 */}
        <div className="form-group">
          <label>급여 (만원)</label>
          <div className="salary-group">
            <input
              type="number"
              name="jobSalaryMin"
              value={formData.jobSalaryMin}
              onChange={handleChange}
              placeholder="최소"
              min="0"
            />
            <span>~</span>
            <input
              type="number"
              name="jobSalaryMax"
              value={formData.jobSalaryMax}
              onChange={handleChange}
              placeholder="최대"
              min="0"
            />
          </div>
          {errors.salary && (
            <span className="error-message">{errors.salary}</span>
          )}
        </div>

        {/* 마감일 */}
        <div className="form-group">
          <label>마감일</label>
          <input
            type="date"
            name="jobDeadline"
            value={formData.jobDeadline}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />
          <small>마감일을 설정하지 않으면 상시채용으로 등록됩니다.</small>
        </div>

        {/* 업종 */}
        <div className="form-group">
          <label>업종</label>
          <div className="checkbox-group">
            {industries.map((industry) => (
              <label key={industry.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.jobIndustries.includes(industry.value)}
                  onChange={() =>
                    handleMultiSelect("jobIndustries", industry.value)
                  }
                />
                {industry.label}
              </label>
            ))}
          </div>
        </div>

        {/* 기업형태 */}
        <div className="form-group">
          <label>기업형태</label>
          <div className="checkbox-group">
            {companyTypes.map((type) => (
              <label key={type.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.jobCompanyTypes.includes(type.value)}
                  onChange={() =>
                    handleMultiSelect("jobCompanyTypes", type.value)
                  }
                />
                {type.label}
              </label>
            ))}
          </div>
        </div>

        {/* 근무형태 */}
        <div className="form-group">
          <label>근무형태</label>
          <div className="checkbox-group">
            {workTypes.map((type) => (
              <label key={type.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.jobWorkTypes.includes(type.value)}
                  onChange={() => handleMultiSelect("jobWorkTypes", type.value)}
                />
                {type.label}
              </label>
            ))}
          </div>
        </div>

        {/* 근무요일 */}
        <div className="form-group">
          <label>근무요일</label>
          <div className="checkbox-group">
            {workDays.map((day) => (
              <label key={day.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.jobWorkDays.includes(day.value)}
                  onChange={() => handleMultiSelect("jobWorkDays", day.value)}
                />
                {day.label}
              </label>
            ))}
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="form-group">
          <label className="required">상세 내용</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="채용 상세 내용을 입력하세요"
            rows="15"
            className={errors.content ? "error" : ""}
          />
          {errors.content && (
            <span className="error-message">{errors.content}</span>
          )}
        </div>

        {/* 버튼 */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
            disabled={submitting}
          >
            취소
          </button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardJobCreatePage;
