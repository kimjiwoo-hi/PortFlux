import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, toggleBookmark, deleteJob } from "../api/jobApi";
import { getEducationLabel } from "../database/educationOptions";
import "../pages/BoardJobDetailPage.css";

const BoardJobDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 채용공고 상세 정보 로드
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const data = await getJobDetail(postId);
        setJob(data);
        setIsBookmarked(data.isBookmarked || false);
      } catch (err) {
        console.error("채용공고 로드 실패:", err);
        setError("채용공고를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [postId]);

  // 북마크 토글
  const handleBookmark = async () => {
    try {
      const result = await toggleBookmark(postId);
      setIsBookmarked(result.bookmarked);
    } catch (err) {
      console.error("북마크 처리 실패:", err);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  // 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/board/job/edit/${postId}`);
  };

  // 채용공고 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteJob(postId);
      alert("채용공고가 삭제되었습니다.");
      navigate("/board/job");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 목록으로 돌아가기
  const handleBack = () => {
    navigate("/board/job");
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="job-detail-container">
        <div className="error">{error}</div>
        <button onClick={handleBack} className="btn-back">
          목록으로
        </button>
      </div>
    );
  }

  // 채용공고 없음
  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="error">채용공고를 찾을 수 없습니다.</div>
        <button onClick={handleBack} className="btn-back">
          목록으로
        </button>
      </div>
    );
  }

  // 현재 사용자가 작성자인지 확인 (세션에서 companyNum 확인 필요)
  const isOwner = false; // TODO: 실제 세션 체크 로직 추가

  return (
    <div className="job-detail-container">
      {/* 헤더 */}
      <div className="job-detail-header">
        <button onClick={handleBack} className="btn-back">
          ← 목록으로
        </button>
        <div className="header-actions">
          <button
            onClick={handleBookmark}
            className={`btn-bookmark ${isBookmarked ? "active" : ""}`}
          >
            {isBookmarked ? "★" : "☆"} 북마크
          </button>
          {isOwner && (
            <>
              <button onClick={handleEdit} className="btn-edit">
                수정
              </button>
              <button onClick={handleDelete} className="btn-delete">
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 기업 정보 */}
      <div className="company-info">
        <div className="company-image">
          {job.companyImage ? (
            <img src={job.companyImage} alt={job.companyName} />
          ) : (
            <div className="no-image">이미지 없음</div>
          )}
        </div>
        <div className="company-details">
          <h2 className="company-name">{job.companyName}</h2>
          <div className="job-status-badges">
            {job.isNew && <span className="badge badge-new">NEW</span>}
            {job.isDeadlineSoon && (
              <span className="badge badge-deadline">마감임박</span>
            )}
            <span
              className={`badge badge-status ${job.jobStatus.toLowerCase()}`}
            >
              {job.jobStatus === "ACTIVE"
                ? "채용중"
                : job.jobStatus === "CLOSED"
                ? "마감"
                : "만료"}
            </span>
          </div>
        </div>
      </div>

      {/* 제목 */}
      <h1 className="job-title">{job.title}</h1>

      {/* 기본 정보 */}
      <div className="job-info-grid">
        <div className="info-item">
          <span className="info-label">📍 근무지역</span>
          <span className="info-value">{job.jobRegion || "미정"}</span>
        </div>
        <div className="info-item">
          <span className="info-label">💼 경력</span>
          <span className="info-value">
            {job.jobCareerType && job.jobCareerType.length > 0
              ? job.jobCareerType.join(", ")
              : "무관"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">📅 경력연차</span>
          <span className="info-value">
            {job.jobCareerYears && job.jobCareerYears.length > 0
              ? job.jobCareerYears.join(", ")
              : "무관"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">🎓 학력</span>
          <span className="info-value">
            {job.jobEducationExclude
              ? "학력무관"
              : getEducationLabel(job.jobEducation)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">💰 급여</span>
          <span className="info-value">
            {job.jobSalaryMin && job.jobSalaryMax
              ? `${job.jobSalaryMin.toLocaleString()}만원 ~ ${job.jobSalaryMax.toLocaleString()}만원`
              : job.jobSalaryMin
              ? `${job.jobSalaryMin.toLocaleString()}만원 이상`
              : "회사내규에 따름"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">⏰ 마감일</span>
          <span className="info-value">
            {job.jobDeadline
              ? `${new Date(job.jobDeadline).toLocaleDateString()} (D-${
                  job.daysLeft
                })`
              : "상시채용"}
          </span>
        </div>
      </div>

      {/* 추가 정보 */}
      {(job.jobIndustries?.length > 0 ||
        job.jobCompanyTypes?.length > 0 ||
        job.jobWorkTypes?.length > 0 ||
        job.jobWorkDays?.length > 0) && (
        <div className="job-additional-info">
          {job.jobIndustries?.length > 0 && (
            <div className="info-section">
              <h3>업종</h3>
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
            <div className="info-section">
              <h3>기업형태</h3>
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
            <div className="info-section">
              <h3>근무형태</h3>
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
            <div className="info-section">
              <h3>근무요일</h3>
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
      <div className="job-content">
        <h3>상세 내용</h3>
        <div
          className="content-text"
          dangerouslySetInnerHTML={{ __html: job.content }}
        />
      </div>

      {/* 하단 정보 */}
      <div className="job-footer">
        <div className="footer-info">
          <span>조회수 {job.viewCnt}</span>
          <span>작성일 {new Date(job.createdAt).toLocaleDateString()}</span>
          {job.updatedAt && job.updatedAt !== job.createdAt && (
            <span>수정일 {new Date(job.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* 지원하기 버튼 */}
      {job.jobStatus === "ACTIVE" && !isOwner && (
        <div className="apply-section">
          <button className="btn-apply">지원하기</button>
        </div>
      )}
    </div>
  );
};

export default BoardJobDetailPage;
