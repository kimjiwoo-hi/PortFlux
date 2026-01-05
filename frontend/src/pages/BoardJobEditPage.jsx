import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, updateJob } from "../api/jobApi";
import { careerTypes, careerYears } from "../database/careerOptions";
import { educationLevels } from "../database/educationOptions";
import {
  mainRegions,
  getSubRegions,
  getParentRegion,
} from "../database/regions";
import {
  industries,
  companyTypes,
  workTypes,
  workDays,
} from "../database/jobFilterOptions";
import "./BoardJobEditPage.css";

const BoardJobEditPage = () => {
  const { postId } = useParams();
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
    jobStatus: "ACTIVE",
    companyLogo: "", // 기업 로고 이미지
    companyPhone: "", // 문의 전화번호
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMainRegion, setSelectedMainRegion] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // 오늘 날짜 (마감일 최소값)
  const today = new Date().toISOString().split("T")[0];

  // 기존 데이터 로드
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const data = await getJobDetail(postId);

        // 권한 체크
        if (data.isOwner === false) {
          alert("수정 권한이 없습니다.");
          navigate("/boardjob");
          return;
        }

        // 지역 정보에서 상위 지역 추출
        if (data.jobRegion) {
          const parentRegion = getParentRegion(data.jobRegion);
          if (parentRegion) {
            setSelectedMainRegion(parentRegion.id);
          }
        }

        // jobEducationExclude: 'Y'/'N' → boolean 변환
        const educationExclude =
          data.jobEducationExclude === true || data.jobEducationExclude === "Y";

        // 폼 데이터 설정
        const formDataInit = {
          title: data.title || "",
          content: data.content || "",
          jobRegion: data.jobRegion || "",
          jobCareerType: Array.isArray(data.jobCareerType)
            ? data.jobCareerType
            : [],
          jobCareerYears: Array.isArray(data.jobCareerYears)
            ? data.jobCareerYears
            : [],
          jobEducation: data.jobEducation || "",
          jobEducationExclude: educationExclude,
          jobSalaryMin: data.jobSalaryMin || "",
          jobSalaryMax: data.jobSalaryMax || "",
          jobDeadline: data.jobDeadline ? data.jobDeadline.split("T")[0] : "",
          jobIndustries: Array.isArray(data.jobIndustries)
            ? data.jobIndustries
            : [],
          jobCompanyTypes: Array.isArray(data.jobCompanyTypes)
            ? data.jobCompanyTypes
            : [],
          jobWorkTypes: Array.isArray(data.jobWorkTypes)
            ? data.jobWorkTypes
            : [],
          jobWorkDays: Array.isArray(data.jobWorkDays) ? data.jobWorkDays : [],
          jobStatus: data.jobStatus || "ACTIVE",
          companyLogo: data.companyLogo || "",
          companyPhone: data.companyPhone || "",
        };

        setFormData(formDataInit);
        setOriginalData(formDataInit);

        // 기존 로고 이미지가 있으면 미리보기 설정
        if (data.companyLogo) {
          setLogoPreview(data.companyLogo);
        }
      } catch (error) {
        console.error("채용공고 로드 실패:", error);
        if (error.message?.includes("404")) {
          alert("채용공고를 찾을 수 없습니다.");
        } else if (error.message?.includes("401")) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        } else {
          alert("채용공고를 불러오는 중 오류가 발생했습니다.");
        }
        navigate("/boardjob");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchJobData();
    }
  }, [postId, navigate]);

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

  // 로고 이미지 변경 핸들러
  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 크기는 5MB를 초과할 수 없습니다.");
        return;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          companyLogo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 로고 이미지 삭제 핸들러
  const handleLogoDelete = useCallback(() => {
    setLogoPreview(null);
    setFormData((prev) => ({
      ...prev,
      companyLogo: "",
    }));
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
        // jobEducationExclude: boolean → 그대로 전송 (백엔드에서 처리)
      };

      await updateJob(postId, jobData);
      alert("채용공고가 수정되었습니다.");
      navigate(`/boardjob/${postId}`);
    } catch (error) {
      console.error("채용공고 수정 실패:", error);
      if (error.message?.includes("401")) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else if (error.message?.includes("403")) {
        alert("수정 권한이 없습니다.");
        navigate("/boardjob");
      } else {
        alert(error.message || "채용공고 수정에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    // 변경사항 확인
    const hasChanges =
      originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

    if (hasChanges) {
      if (!window.confirm("수정 중인 내용이 있습니다. 취소하시겠습니까?")) {
        return;
      }
    }
    navigate(`/boardjob/${postId}`);
  }, [formData, originalData, navigate, postId]);

  // 로딩 중
  if (loading) {
    return (
      <div className="job-edit-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>채용공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-edit-container">
      <div className="job-edit-card">
        {/* 헤더 */}
        <div className="job-edit-header">
          <h1>채용공고 수정</h1>
          <p>공고 정보를 수정해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="job-edit-form">
          {/* 공고 상태 섹션 */}
          <section className="form-section status-section">
            <h2 className="section-title">공고 상태</h2>

            <div className="form-group">
              <label className="required">공고 상태</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="jobStatus"
                    value="ACTIVE"
                    checked={formData.jobStatus === "ACTIVE"}
                    onChange={handleChange}
                  />
                  <span className="radio-text">채용중</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="jobStatus"
                    value="CLOSED"
                    checked={formData.jobStatus === "CLOSED"}
                    onChange={handleChange}
                  />
                  <span className="radio-text">마감</span>
                </label>
              </div>
              <small className="help-text">
                마감으로 변경 시 구직자에게 노출되지 않습니다.
              </small>
            </div>
          </section>

          {/* 기본 정보 섹션 */}
          <section className="form-section">
            <h2 className="section-title">기본 정보</h2>

            {/* 기업 로고 */}
            <div className="form-group">
              <label>기업 로고</label>
              <div className="logo-upload-container">
                {logoPreview ? (
                  <div className="logo-preview-wrapper">
                    <img
                      src={logoPreview}
                      alt="기업 로고 미리보기"
                      className="logo-preview"
                    />
                    <button
                      type="button"
                      onClick={handleLogoDelete}
                      className="logo-delete-btn"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="logo-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: "none" }}
                    />
                    <div className="logo-upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">로고 이미지 업로드</span>
                      <small className="upload-hint">클릭하여 이미지 선택</small>
                    </div>
                  </label>
                )}
              </div>
              <small className="help-text">
                권장 크기: 200x200px, 최대 5MB
              </small>
            </div>

            {/* 문의 전화번호 */}
            <div className="form-group">
              <label>문의 전화번호</label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="예: 02-1234-5678 또는 010-1234-5678"
                maxLength={20}
              />
              <small className="help-text">
                지원자가 문의할 수 있는 전화번호를 입력하세요
              </small>
            </div>

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
                  disabled={!selectedMainRegion}
                  className={`region-select ${errors.jobRegion ? "error" : ""}`}
                >
                  <option value="">시/군/구 선택</option>
                  {getSubRegions(selectedMainRegion).map((sub) => (
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

            {/* 경력연차 (경력 선택 시에만 표시) */}
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
                미설정 시 상시채용으로 표시됩니다.
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
                  수정 중...
                </>
              ) : (
                "수정 완료"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardJobEditPage;
