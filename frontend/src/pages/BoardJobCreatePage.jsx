import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createJob, isLoggedIn, isCompanyUser } from "../api/jobApi";
import { careerTypes, careerYears } from "../database/careerOptions";
import { educationLevels } from "../database/educationOptions";
import { mainRegions, getSubRegions } from "../database/regions";
import {
  industries,
  companyTypes,
  workTypes,
  workDays,
} from "../database/jobFilterOptions";
import "./BoardJobCreatePage.css";

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
  const [selectedMainRegion, setSelectedMainRegion] = useState("");

  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { from: "/boardjob/create" } });
      return;
    }

    if (!isCompanyUser()) {
      alert("기업 회원만 채용공고를 등록할 수 있습니다.");
      navigate("/boardjob");
    }
  }, [navigate]);

  // 입력 변경 핸들러
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // 에러 초기화
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  // 다중 선택 핸들러
  const handleMultiSelect = useCallback(
    (name, value) => {
      setFormData((prev) => {
        const currentValues = prev[name] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        return { ...prev, [name]: newValues };
      });

      // 에러 초기화
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  // 상위 지역 선택 핸들러
  const handleMainRegionChange = useCallback((e) => {
    const mainRegionId = e.target.value;
    setSelectedMainRegion(mainRegionId);
    setFormData((prev) => ({ ...prev, jobRegion: "" }));
  }, []);

  // 유효성 검사
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "채용공고 제목을 입력해주세요.";
    } else if (formData.title.length > 100) {
      newErrors.title = "제목은 100자 이내로 입력해주세요.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "채용 상세 내용을 입력해주세요.";
    } else if (formData.content.length < 50) {
      newErrors.content = "상세 내용은 최소 50자 이상 입력해주세요.";
    }

    if (!formData.jobRegion) {
      newErrors.jobRegion = "근무지역을 선택해주세요.";
    }

    if (formData.jobCareerType.length === 0) {
      newErrors.jobCareerType = "경력 조건을 선택해주세요.";
    }

    if (!formData.jobEducationExclude && !formData.jobEducation) {
      newErrors.jobEducation =
        "학력 조건을 선택하거나 학력무관을 체크해주세요.";
    }

    // 급여 검증
    if (formData.jobSalaryMin && formData.jobSalaryMax) {
      const min = Number(formData.jobSalaryMin);
      const max = Number(formData.jobSalaryMax);
      if (min > max) {
        newErrors.salary = "최소 급여가 최대 급여보다 클 수 없습니다.";
      }
    }

    // 마감일 검증
    if (formData.jobDeadline) {
      const deadline = new Date(formData.jobDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        newErrors.jobDeadline = "마감일은 오늘 이후로 설정해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = document.querySelector(".error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
        jobDeadline: formData.jobDeadline || null,
        jobStatus: "ACTIVE",
      };

      const result = await createJob(jobData);
      alert("채용공고가 등록되었습니다.");
      navigate(`/boardjob/${result.postId || ""}`);
    } catch (error) {
      console.error("채용공고 등록 실패:", error);
      if (error.response?.status === 401) {
        alert("기업 로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "채용공고 등록에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    if (
      formData.title ||
      formData.content ||
      formData.jobRegion ||
      formData.jobCareerType.length > 0
    ) {
      if (!window.confirm("작성 중인 내용이 있습니다. 취소하시겠습니까?")) {
        return;
      }
    }
    navigate("/boardjob");
  }, [formData, navigate]);

  // 오늘 날짜 (마감일 최소값)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="job-create-container">
      <div className="job-create-card">
        {/* 헤더 */}
        <div className="job-create-header">
          <h1>채용공고 등록</h1>
          <p>구인 정보를 상세히 작성해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="job-create-form">
          {/* 기본 정보 섹션 */}
          <section className="form-section">
            <h2 className="section-title">기본 정보</h2>

            {/* 제목 */}
            <div className="form-group">
              <label className="required">채용공고 제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: [회사명] 백엔드 개발자 채용"
                className={errors.title ? "error" : ""}
                maxLength={100}
              />
              <div className="input-footer">
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
                )}
                <span className="char-count">{formData.title.length}/100</span>
              </div>
            </div>

            {/* 근무지역 */}
            <div className="form-group">
              <label className="required">근무지역</label>
              <div className="region-select-group">
                <select
                  value={selectedMainRegion}
                  onChange={handleMainRegionChange}
                  className="region-select"
                >
                  <option value="">시/도 선택</option>
                  {mainRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <select
                  name="jobRegion"
                  value={formData.jobRegion}
                  onChange={handleChange}
                  className={`region-select ${errors.jobRegion ? "error" : ""}`}
                  disabled={!selectedMainRegion}
                >
                  <option value="">구/군 선택</option>
                  {selectedMainRegion &&
                    getSubRegions(selectedMainRegion).map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                </select>
              </div>
              {errors.jobRegion && (
                <span className="error-message">{errors.jobRegion}</span>
              )}
            </div>
          </section>

          {/* 자격 요건 섹션 */}
          <section className="form-section">
            <h2 className="section-title">자격 요건</h2>

            {/* 경력 */}
            <div className="form-group">
              <label className="required">경력</label>
              <div className="checkbox-group">
                {careerTypes.map((type) => (
                  <label key={type.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.jobCareerType.includes(type.value)}
                      onChange={() =>
                        handleMultiSelect("jobCareerType", type.value)
                      }
                    />
                    <span className="checkbox-text">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.jobCareerType && (
                <span className="error-message">{errors.jobCareerType}</span>
              )}
            </div>

            {/* 경력 연차 (경력 선택 시) */}
            {formData.jobCareerType.includes("경력") && (
              <div className="form-group">
                <label>경력 연차</label>
                <div className="checkbox-group wrap">
                  {careerYears.map((year) => (
                    <label key={year.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.jobCareerYears.includes(year.value)}
                        onChange={() =>
                          handleMultiSelect("jobCareerYears", year.value)
                        }
                      />
                      <span className="checkbox-text">{year.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 학력 */}
            <div className="form-group">
              <label className="required">학력</label>
              <div className="education-group">
                <label className="checkbox-item highlight">
                  <input
                    type="checkbox"
                    name="jobEducationExclude"
                    checked={formData.jobEducationExclude}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">학력무관</span>
                </label>
                <select
                  name="jobEducation"
                  value={formData.jobEducation}
                  onChange={handleChange}
                  disabled={formData.jobEducationExclude}
                  className={
                    errors.jobEducation && !formData.jobEducationExclude
                      ? "error"
                      : ""
                  }
                >
                  <option value="">학력 선택</option>
                  {educationLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.jobEducation && !formData.jobEducationExclude && (
                <span className="error-message">{errors.jobEducation}</span>
              )}
            </div>
          </section>

          {/* 근무 조건 섹션 */}
          <section className="form-section">
            <h2 className="section-title">근무 조건</h2>

            {/* 급여 */}
            <div className="form-group">
              <label>급여 (연봉, 만원)</label>
              <div className="salary-group">
                <input
                  type="number"
                  name="jobSalaryMin"
                  value={formData.jobSalaryMin}
                  onChange={handleChange}
                  placeholder="최소"
                  min="0"
                  max="99999"
                />
                <span className="salary-divider">~</span>
                <input
                  type="number"
                  name="jobSalaryMax"
                  value={formData.jobSalaryMax}
                  onChange={handleChange}
                  placeholder="최대"
                  min="0"
                  max="99999"
                />
              </div>
              {errors.salary && (
                <span className="error-message">{errors.salary}</span>
              )}
              <small className="help-text">
                미입력 시 "회사내규에 따름"으로 표시됩니다.
              </small>
            </div>

            {/* 마감일 */}
            <div className="form-group">
              <label>채용 마감일</label>
              <input
                type="date"
                name="jobDeadline"
                value={formData.jobDeadline}
                onChange={handleChange}
                min={today}
                className={errors.jobDeadline ? "error" : ""}
              />
              {errors.jobDeadline && (
                <span className="error-message">{errors.jobDeadline}</span>
              )}
              <small className="help-text">
                미설정 시 상시채용으로 등록됩니다.
              </small>
            </div>

            {/* 근무형태 */}
            <div className="form-group">
              <label>근무형태</label>
              <div className="checkbox-group wrap">
                {workTypes.map((type) => (
                  <label key={type.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.jobWorkTypes.includes(type.value)}
                      onChange={() =>
                        handleMultiSelect("jobWorkTypes", type.value)
                      }
                    />
                    <span className="checkbox-text">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 근무요일 */}
            <div className="form-group">
              <label>근무요일</label>
              <div className="checkbox-group wrap">
                {workDays.map((day) => (
                  <label key={day.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.jobWorkDays.includes(day.value)}
                      onChange={() =>
                        handleMultiSelect("jobWorkDays", day.value)
                      }
                    />
                    <span className="checkbox-text">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 기업/업종 정보 섹션 */}
          <section className="form-section">
            <h2 className="section-title">기업/업종 정보</h2>

            {/* 업종 */}
            <div className="form-group">
              <label>업종</label>
              <div className="checkbox-group wrap">
                {industries.map((industry) => (
                  <label key={industry.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.jobIndustries.includes(industry.value)}
                      onChange={() =>
                        handleMultiSelect("jobIndustries", industry.value)
                      }
                    />
                    <span className="checkbox-text">{industry.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 기업형태 */}
            <div className="form-group">
              <label>기업형태</label>
              <div className="checkbox-group wrap">
                {companyTypes.map((type) => (
                  <label key={type.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.jobCompanyTypes.includes(type.value)}
                      onChange={() =>
                        handleMultiSelect("jobCompanyTypes", type.value)
                      }
                    />
                    <span className="checkbox-text">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 상세 내용 섹션 */}
          <section className="form-section">
            <h2 className="section-title">상세 내용</h2>

            <div className="form-group">
              <label className="required">채용 상세 내용</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="담당 업무, 자격 요건, 우대 사항, 복리후생 등 상세 내용을 입력해주세요."
                rows="15"
                className={errors.content ? "error" : ""}
              />
              <div className="input-footer">
                {errors.content && (
                  <span className="error-message">{errors.content}</span>
                )}
                <span className="char-count">{formData.content.length}자</span>
              </div>
            </div>
          </section>

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
              {submitting ? (
                <>
                  <span className="btn-spinner"></span>
                  등록 중...
                </>
              ) : (
                "채용공고 등록"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardJobCreatePage;