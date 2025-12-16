import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../api/jobApi";
import { careerTypes } from "../database/careerOptions";
import { educationLevels } from "../database/educationOptions";
import {
  industries,
  companyTypes,
  workTypes,
  workDays,
} from "../database/jobFilterOptions";
import "../pages/BoardJobPage.css";

const BoardJobPage = () => {
  const navigate = useNavigate();

  // 채용공고 목록
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 페이징
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  // 필터
  const [filters, setFilters] = useState({
    regions: [],
    careerType: [],
    careerYears: [],
    education: "",
    educationExclude: false,
    industries: [],
    companyTypes: [],
    workTypes: [],
    workDays: [],
    salaryMin: "",
    keyword: "",
  });

  // 정렬
  const [sortType, setSortType] = useState("latest"); // latest, views, deadline

  // 필터 패널 표시 여부
  const [showFilters, setShowFilters] = useState(false);

  // 지역 목록
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

  // 채용공고 목록 로드
  useEffect(() => {
    fetchJobs();
  }, [currentPage, sortType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs(filters, currentPage, pageSize, sortType);
      setJobs(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("채용공고 로드 실패:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterName] || [];

      if (Array.isArray(currentValues)) {
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        return { ...prev, [filterName]: newValues };
      } else {
        return { ...prev, [filterName]: value };
      }
    });
  };

  // 검색어 변경
  const handleKeywordChange = (e) => {
    setFilters((prev) => ({ ...prev, keyword: e.target.value }));
  };

  // 필터 적용
  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchJobs();
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      regions: [],
      careerType: [],
      careerYears: [],
      education: "",
      educationExclude: false,
      industries: [],
      companyTypes: [],
      workTypes: [],
      workDays: [],
      salaryMin: "",
      keyword: "",
    });
    setCurrentPage(0);
  };

  // 정렬 변경
  const handleSortChange = (newSort) => {
    setSortType(newSort);
    setCurrentPage(0);
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // 채용공고 카드 클릭
  const handleJobClick = (postId) => {
    navigate(`/boardjob/${postId}`);
  };

  // 작성 페이지로 이동
  const handleCreate = () => {
    navigate("/boardjob/create");
  };

  // 로딩 중
  if (loading && currentPage === 0) {
    return (
      <div className="board-job-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="board-job-container">
      {/* 헤더 */}
      <div className="board-job-header">
        <h1>채용공고</h1>
        <button onClick={handleCreate} className="btn-create">
          채용공고 등록
        </button>
      </div>

      {/* 검색 & 필터 토글 */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="제목, 기업명으로 검색"
            value={filters.keyword}
            onChange={handleKeywordChange}
            onKeyPress={(e) => e.key === "Enter" && handleApplyFilters()}
          />
          <button onClick={handleApplyFilters} className="btn-search">
            검색
          </button>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-filter-toggle"
        >
          {showFilters ? "필터 숨기기" : "필터 보기"}
        </button>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="filter-panel">
          {/* 지역 */}
          <div className="filter-group">
            <h3>지역</h3>
            <div className="filter-items">
              {regions.map((region) => (
                <label key={region} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region)}
                    onChange={() => handleFilterChange("regions", region)}
                  />
                  {region}
                </label>
              ))}
            </div>
          </div>

          {/* 경력 타입 */}
          <div className="filter-group">
            <h3>경력</h3>
            <div className="filter-items">
              {careerTypes.map((type) => (
                <label key={type.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.careerType.includes(type.value)}
                    onChange={() =>
                      handleFilterChange("careerType", type.value)
                    }
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          {/* 학력 */}
          <div className="filter-group">
            <h3>학력</h3>
            <select
              value={filters.education}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, education: e.target.value }))
              }
              disabled={filters.educationExclude}
            >
              <option value="">전체</option>
              {educationLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.educationExclude}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    educationExclude: e.target.checked,
                    education: e.target.checked ? "" : prev.education,
                  }))
                }
              />
              학력무관
            </label>
          </div>

          {/* 급여 */}
          <div className="filter-group">
            <h3>급여 (만원)</h3>
            <input
              type="number"
              placeholder="최소 급여"
              value={filters.salaryMin}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, salaryMin: e.target.value }))
              }
              min="0"
            />
          </div>

          {/* 필터 버튼 */}
          <div className="filter-actions">
            <button onClick={handleResetFilters} className="btn-reset">
              초기화
            </button>
            <button onClick={handleApplyFilters} className="btn-apply">
              적용
            </button>
          </div>
        </div>
      )}

      {/* 정렬 & 결과 개수 */}
      <div className="result-header">
        <div className="result-count">
          총 <strong>{totalElements}</strong>개의 채용공고
        </div>
        <div className="sort-buttons">
          <button
            className={sortType === "latest" ? "active" : ""}
            onClick={() => handleSortChange("latest")}
          >
            최신순
          </button>
          <button
            className={sortType === "views" ? "active" : ""}
            onClick={() => handleSortChange("views")}
          >
            조회순
          </button>
          <button
            className={sortType === "deadline" ? "active" : ""}
            onClick={() => handleSortChange("deadline")}
          >
            마감순
          </button>
        </div>
      </div>

      {/* 채용공고 목록 */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : jobs.length === 0 ? (
        <div className="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div
              key={job.postId}
              className="job-card"
              onClick={() => handleJobClick(job.postId)}
            >
              {/* 기업 이미지 */}
              <div className="job-card-image">
                {job.companyImage ? (
                  <img src={job.companyImage} alt={job.companyName} />
                ) : (
                  <div className="no-image">이미지 없음</div>
                )}
              </div>

              {/* 채용공고 정보 */}
              <div className="job-card-content">
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-badges">
                    {job.isNew && <span className="badge badge-new">NEW</span>}
                    {job.isDeadlineSoon && (
                      <span className="badge badge-deadline">마감임박</span>
                    )}
                  </div>
                </div>

                <div className="company-name">{job.companyName}</div>

                <div className="job-info">
                  <span className="info-item">📍 {job.jobRegion}</span>
                  <span className="info-item">
                    💼{" "}
                    {job.jobCareerType && job.jobCareerType.length > 0
                      ? job.jobCareerType.join(", ")
                      : "경력무관"}
                  </span>
                  {job.jobSalaryMin && (
                    <span className="info-item">
                      💰 {job.jobSalaryMin.toLocaleString()}만원 이상
                    </span>
                  )}
                </div>

                <div className="job-footer">
                  <span className="view-count">👁️ {job.viewCnt}</span>
                  <span className="created-date">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  {job.jobDeadline && (
                    <span className="deadline">마감 D-{job.daysLeft}</span>
                  )}
                </div>
              </div>

              {/* 북마크 */}
              {job.isBookmarked && <div className="bookmark-icon">★</div>}
            </div>
          ))}
        </div>
      )}

      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="btn-page"
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`btn-page ${currentPage === index ? "active" : ""}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="btn-page"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardJobPage;
