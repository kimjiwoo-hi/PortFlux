import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, toggleBookmark, deleteJob } from "../api/jobApi";
import { getEducationLabel } from "../database/educationOptions";
import { getRegionLabel } from "../database/regions";
import { formatSalary, getJobStatusLabel } from "../database/jobFilterOptions";
import "./BoardJobDetailPage.css";

const BoardJobDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 채용공고 상세 정보 로드
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJobDetail(postId);

        // getJobDetail이 이미 { ...job, isOwner } 형태로 반환
        setJob(data);
        setIsBookmarked(data.isBookmarked || false);
        setIsOwner(data.isOwner || false);
      } catch (err) {
        console.error("채용공고 로드 실패:", err);
        if (err.message?.includes("404")) {
          setError("채용공고를 찾을 수 없습니다.");
        } else {
          setError("채용공고를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchJobDetail();
    }
  }, [postId]);

  // 북마크 토글
  const handleBookmark = useCallback(async () => {
    if (bookmarkLoading) return;

    try {
      setBookmarkLoading(true);
      const result = await toggleBookmark(postId);
      setIsBookmarked(result.bookmarked);
    } catch (err) {
      console.error("북마크 처리 실패:", err);
      if (err.message?.includes("401")) {
        alert("로그인이 필요합니다.");
        navigate("/login", { state: { from: `/boardjob/${postId}` } });
      } else {
        alert("북마크 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setBookmarkLoading(false);
    }
  }, [postId, bookmarkLoading, navigate]);

  // 수정 페이지로 이동
  const handleEdit = useCallback(() => {
    navigate(`/boardjob/edit/${postId}`);
  }, [navigate, postId]);

  // 채용공고 삭제
  const handleDelete = useCallback(async () => {
    if (
      !window.confirm(
        "정말 삭제하시겠습니까?\n삭제된 공고는 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await deleteJob(postId);
      alert("채용공고가 삭제되었습니다.");
      navigate("/boardjob");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert(err.message || "삭제 중 오류가 발생했습니다.");
    }
  }, [postId, navigate]);

  // 목록으로 돌아가기
  const handleBack = useCallback(() => {
    navigate("/boardjob");
  }, [navigate]);

  // 지원하기 (임시)
  const handleApply = useCallback(() => {
    alert("지원하기 기능은 준비 중입니다.");
  }, []);

  // 공유하기
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: job?.title,
          text: `${job?.companyName}에서 ${job?.title} 채용 중`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다.");
    }
  }, [job]);

  // 경력 표시 헬퍼 (배열 또는 문자열 모두 처리)
  const displayCareerType = useCallback((careerType) => {
    if (!careerType) return "경력무관";
    if (Array.isArray(careerType)) {
      return careerType.length > 0 ? careerType.join(", ") : "경력무관";
    }
    return careerType;
  }, []);

  // 경력연차 표시 헬퍼
  const displayCareerYears = useCallback((careerYears) => {
    if (!careerYears) return "무관";
    if (Array.isArray(careerYears)) {
      return careerYears.length > 0 ? careerYears.join(", ") : "무관";
    }
    return careerYears;
  }, []);

  // 학력 표시 헬퍼 (jobEducationExclude는 'Y'/'N' 또는 boolean)
  const displayEducation = useCallback((education, educationExclude) => {
    if (educationExclude === true || educationExclude === "Y") {
      return "학력무관";
    }
    return getEducationLabel(education);
  }, []);

  // 로딩 중
  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>채용공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="job-detail-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={handleBack} className="btn-back-large">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 채용공고 없음
  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="error-state">
          <div className="error-icon">🔭</div>
          <p>채용공고를 찾을 수 없습니다.</p>
          <button onClick={handleBack} className="btn-back-large">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 마감 여부 확인
  const isExpired = job.jobStatus === "EXPIRED" || job.jobStatus === "CLOSED";

  return (
    <div className="job-detail-container">
      {/* 상단 네비게이션 */}
      <div className="detail-nav">
        <button onClick={handleBack} className="btn-nav-back">
          <span className="nav-icon">←</span>
          목록으로
        </button>
        <div className="nav-actions">
          <button
            onClick={handleShare}
            className="btn-nav-action"
            title="공유하기"
          >
            🔗
          </button>
          <button
            onClick={handleBookmark}
            className={`btn-nav-action btn-bookmark ${
              isBookmarked ? "active" : ""
            }`}
            disabled={bookmarkLoading}
            title={isBookmarked ? "북마크 해제" : "북마크 추가"}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="detail-main">
        {/* 좌측: 공고 정보 */}
        <div className="detail-content">
          {/* 기업 정보 헤더 */}
          <div className="company-header">
            <div className="company-logo">
              {job.companyImage ? (
                <img src={job.companyImage} alt={job.companyName} />
              ) : (
                <div className="logo-placeholder">
                  <span>{job.companyName?.charAt(0) || "?"}</span>
                </div>
              )}
            </div>
            <div className="company-info">
              <div className="company-name-row">
                <h2 className="company-name">{job.companyName}</h2>
                {isOwner && (
                  <div className="owner-actions">
                    <button onClick={handleEdit} className="btn-owner btn-edit">
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="btn-owner btn-delete"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <div className="job-badges">
                {job.isNew && <span className="badge badge-new">NEW</span>}
                {job.isDeadlineSoon && !isExpired && (
                  <span className="badge badge-deadline">마감임박</span>
                )}
                <span
                  className={`badge badge-status ${
                    job.jobStatus === "ACTIVE"
                      ? "active"
                      : job.jobStatus?.toLowerCase()
                  }`}
                >
                  {getJobStatusLabel(job.jobStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* 공고 제목 */}
          <h1 className="job-title">{job.title}</h1>

          {/* 핵심 정보 그리드 */}
          <div className="key-info-grid">
            <div className="key-info-item">
              <span className="key-icon">📍</span>
              <div className="key-content">
                <span className="key-label">근무지역</span>
                <span className="key-value">
                  {getRegionLabel(job.jobRegion)}
                </span>
              </div>
            </div>
            <div className="key-info-item">
              <span className="key-icon">💼</span>
              <div className="key-content">
                <span className="key-label">경력</span>
                <span className="key-value">
                  {displayCareerType(job.jobCareerType)}
                </span>
              </div>
            </div>
            <div className="key-info-item">
              <span className="key-icon">📅</span>
              <div className="key-content">
                <span className="key-label">경력연차</span>
                <span className="key-value">
                  {displayCareerYears(job.jobCareerYears)}
                </span>
              </div>
            </div>
            <div className="key-info-item">
              <span className="key-icon">🎓</span>
              <div className="key-content">
                <span className="key-label">학력</span>
                <span className="key-value">
                  {displayEducation(job.jobEducation, job.jobEducationExclude)}
                </span>
              </div>
            </div>
            <div className="key-info-item">
              <span className="key-icon">💰</span>
              <div className="key-content">
                <span className="key-label">급여</span>
                <span className="key-value salary">
                  {formatSalary(job.jobSalaryMin, job.jobSalaryMax)}
                </span>
              </div>
            </div>
            <div className="key-info-item">
              <span className="key-icon">⏰</span>
              <div className="key-content">
                <span className="key-label">마감일</span>
                <span
                  className={`key-value ${job.isDeadlineSoon ? "urgent" : ""}`}
                >
                  {job.jobDeadline
                    ? `${new Date(job.jobDeadline).toLocaleDateString()}${
                        job.daysLeft !== undefined ? ` (D-${job.daysLeft})` : ""
                      }`
                    : "상시채용"}
                </span>
              </div>
            </div>
          </div>

          {/* 추가 정보 태그 */}
          {(job.jobIndustries?.length > 0 ||
            job.jobCompanyTypes?.length > 0 ||
            job.jobWorkTypes?.length > 0 ||
            job.jobWorkDays?.length > 0) && (
            <div className="additional-info">
              {job.jobIndustries?.length > 0 && (
                <div className="info-group">
                  <span className="info-group-label">업종</span>
                  <div className="tag-list">
                    {job.jobIndustries.map((industry, index) => (
                      <span key={index} className="tag">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.jobCompanyTypes?.length > 0 && (
                <div className="info-group">
                  <span className="info-group-label">기업형태</span>
                  <div className="tag-list">
                    {job.jobCompanyTypes.map((type, index) => (
                      <span key={index} className="tag">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.jobWorkTypes?.length > 0 && (
                <div className="info-group">
                  <span className="info-group-label">근무형태</span>
                  <div className="tag-list">
                    {job.jobWorkTypes.map((type, index) => (
                      <span key={index} className="tag">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.jobWorkDays?.length > 0 && (
                <div className="info-group">
                  <span className="info-group-label">근무요일</span>
                  <div className="tag-list">
                    {job.jobWorkDays.map((day, index) => (
                      <span key={index} className="tag">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 상세 내용 */}
          <div className="job-description">
            <h3 className="section-title">상세 내용</h3>
            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: job.content?.replace(/\n/g, "<br/>"),
              }}
            />
          </div>

          {/* 하단 메타 정보 */}
          <div className="job-meta">
            <span>조회수 {job.viewCnt?.toLocaleString() || 0}</span>
            <span className="meta-divider">|</span>
            <span>등록일 {new Date(job.createdAt).toLocaleDateString()}</span>
            {job.updatedAt && job.updatedAt !== job.createdAt && (
              <>
                <span className="meta-divider">|</span>
                <span>
                  수정일 {new Date(job.updatedAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 우측: 지원 사이드바 */}
        <div className="apply-sidebar">
          <div className="apply-card">
            <div className="apply-card-header">
              <h3>{job.companyName}</h3>
              <p className="apply-title">{job.title}</p>
            </div>

            <div className="apply-info">
              <div className="apply-info-row">
                <span className="apply-label">마감일</span>
                <span className={`apply-value ${isExpired ? "expired" : ""}`}>
                  {isExpired
                    ? "마감"
                    : job.jobDeadline
                    ? `${new Date(job.jobDeadline).toLocaleDateString()}`
                    : "상시채용"}
                </span>
              </div>
              <div className="apply-info-row">
                <span className="apply-label">급여</span>
                <span className="apply-value">
                  {formatSalary(job.jobSalaryMin, job.jobSalaryMax)}
                </span>
              </div>
            </div>

            {!isOwner && (
              <div className="apply-actions">
                {!isExpired ? (
                  <button onClick={handleApply} className="btn-apply-main">
                    지원하기
                  </button>
                ) : (
                  <button className="btn-apply-main disabled" disabled>
                    마감된 공고
                  </button>
                )}
                <button
                  onClick={handleBookmark}
                  className={`btn-apply-bookmark ${
                    isBookmarked ? "active" : ""
                  }`}
                  disabled={bookmarkLoading}
                >
                  {isBookmarked ? "★ 북마크됨" : "☆ 북마크"}
                </button>
              </div>
            )}
          </div>

          {/* 기업 정보 카드 */}
          <div className="company-card">
            <h4>기업 정보</h4>
            <div className="company-card-content">
              <div className="company-card-logo">
                {job.companyImage ? (
                  <img src={job.companyImage} alt={job.companyName} />
                ) : (
                  <div className="logo-placeholder small">
                    <span>{job.companyName?.charAt(0) || "?"}</span>
                  </div>
                )}
              </div>
              <div className="company-card-info">
                <span className="company-card-name">{job.companyName}</span>
                {job.jobIndustries?.length > 0 && (
                  <span className="company-card-industry">
                    {job.jobIndustries[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardJobDetailPage;
