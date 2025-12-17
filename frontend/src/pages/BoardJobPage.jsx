import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getJobs, getJobCountByRegion } from "../api/jobApi";
import {
  mainRegions,
  getSubRegions,
  getRegionLabel,
} from "../database/regions";
import {
  careerTypes,
  careerYears,
  formatCareerType,
} from "../database/careerOptions";
import {
  educationLevels,
  getEducationLabel,
} from "../database/educationOptions";
import {
  industries,
  companyTypes,
  workTypes,
  workDays,
  salaryRanges,
  sortOptions,
  formatSalary,
} from "../database/jobFilterOptions";
import "./BoardJobPage.css";

const BoardJobPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 상태
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [regionCounts, setRegionCounts] = useState({});

  // 페이징
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // 필터 상태
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
  const [sortType, setSortType] = useState("latest");

  // 필터 패널 상태
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    region: true,
    career: false,
    education: false,
    salary: false,
    industry: false,
    workType: false,
  });
  const [selectedMainRegion, setSelectedMainRegion] = useState("");

  // URL 쿼리 파라미터에서 초기값 로드
  useEffect(() => {
    const keyword = searchParams.get("keyword") || "";
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page")) || 0;

    setFilters((prev) => ({ ...prev, keyword }));
    setSortType(sort);
    setCurrentPage(page);
  }, [searchParams]);

  // URL 파라미터 동기화
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.keyword) {
      params.set("keyword", filters.keyword);
    }
    if (sortType !== "latest") {
      params.set("sort", sortType);
    }
    if (currentPage > 0) {
      params.set("page", currentPage.toString());
    }

    setSearchParams(params, { replace: true });
  }, [filters.keyword, sortType, currentPage, setSearchParams]);

  // 지역별 공고 수 조회
  useEffect(() => {
    const fetchRegionCounts = async () => {
      try {
        const counts = await getJobCountByRegion();
        setRegionCounts(counts);
      } catch (error) {
        console.error("지역별 공고 수 조회 실패:", error);
      }
    };
    fetchRegionCounts();
  }, []);

  // 채용공고 목록 조회
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJobs(filters, currentPage, pageSize, sortType);
      setJobs(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("채용공고 목록 조회 실패:", error);
      setJobs([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, sortType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 필터 변경 핸들러 (배열 토글)
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterName]: newValues };
    });
  }, []);

  // 단일 필터 변경
  const handleSingleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  }, []);

  // 검색어 변경
  const handleKeywordChange = useCallback((e) => {
    setFilters((prev) => ({ ...prev, keyword: e.target.value }));
  }, []);

  // 필터 적용
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(0);
    fetchJobs();
  }, [fetchJobs]);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
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
    setSelectedMainRegion("");
    setCurrentPage(0);
  }, []);

  // 정렬 변경
  const handleSortChange = useCallback((newSort) => {
    setSortType(newSort);
    setCurrentPage(0);
  }, []);

  // 페이지 변경
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 채용공고 클릭
  const handleJobClick = useCallback(
    (postId) => {
      navigate(`/boardjob/${postId}`);
    },
    [navigate]
  );

  // 작성 페이지 이동
  const handleCreate = useCallback(() => {
    navigate("/boardjob/create");
  }, [navigate]);

  // 섹션 토글
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // 선택된 필터 태그 제거
  const removeFilterTag = useCallback((filterName, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[filterName])) {
        return {
          ...prev,
          [filterName]: prev[filterName].filter((v) => v !== value),
        };
      }
      return { ...prev, [filterName]: "" };
    });
  }, []);

  // 선택된 필터 개수 계산
  const selectedFilterCount = useMemo(() => {
    let count = 0;
    count += filters.regions.length;
    count += filters.careerType.length;
    count += filters.careerYears.length;
    count += filters.education ? 1 : 0;
    count += filters.educationExclude ? 1 : 0;
    count += filters.industries.length;
    count += filters.companyTypes.length;
    count += filters.workTypes.length;
    count += filters.workDays.length;
    count += filters.salaryMin ? 1 : 0;
    return count;
  }, [filters]);

  // 선택된 필터 태그 목록
  const selectedFilterTags = useMemo(() => {
    const tags = [];
    filters.regions.forEach((v) =>
      tags.push({ type: "regions", value: v, label: getRegionLabel(v) })
    );
    filters.careerType.forEach((v) =>
      tags.push({ type: "careerType", value: v, label: v })
    );
    filters.careerYears.forEach((v) =>
      tags.push({ type: "careerYears", value: v, label: v })
    );
    if (filters.education) {
      tags.push({
        type: "education",
        value: filters.education,
        label: getEducationLabel(filters.education),
      });
    }
    if (filters.educationExclude) {
      tags.push({ type: "educationExclude", value: true, label: "학력무관" });
    }
    filters.industries.forEach((v) =>
      tags.push({ type: "industries", value: v, label: v })
    );
    filters.companyTypes.forEach((v) =>
      tags.push({ type: "companyTypes", value: v, label: v })
    );
    filters.workTypes.forEach((v) =>
      tags.push({ type: "workTypes", value: v, label: v })
    );
    filters.workDays.forEach((v) =>
      tags.push({ type: "workDays", value: v, label: v })
    );
    if (filters.salaryMin) {
      const range = salaryRanges.find((r) => r.value === filters.salaryMin);
      tags.push({
        type: "salaryMin",
        value: filters.salaryMin,
        label: range?.label || `${filters.salaryMin}만원 이상`,
      });
    }
    return tags;
  }, [filters]);

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
          className="btn-page"
          title="처음"
        >
          «
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="btn-page"
        >
          ‹ 이전
        </button>

        {startPage > 0 && (
          <>
            <button onClick={() => handlePageChange(0)} className="btn-page">
              1
            </button>
            {startPage > 1 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`btn-page ${currentPage === page ? "active" : ""}`}
          >
            {page + 1}
          </button>
        ))}

        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              className="btn-page"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="btn-page"
        >
          다음 ›
        </button>
        <button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="btn-page"
          title="마지막"
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="job-board-container">
      {/* 헤더 */}
      <div className="job-board-header">
        <div className="header-left">
          <h1>채용공고</h1>
          <span className="total-count">
            총 {totalElements.toLocaleString()}건
          </span>
        </div>
        <button onClick={handleCreate} className="btn-create-job">
          <span>+</span> 채용공고 등록
        </button>
      </div>

      {/* 검색 바 */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="기업명, 채용 제목으로 검색"
              value={filters.keyword}
              onChange={handleKeywordChange}
              onKeyPress={(e) => e.key === "Enter" && handleApplyFilters()}
            />
            <button onClick={handleApplyFilters} className="btn-search">
              검색
            </button>
          </div>
        </div>
        <div className="search-options">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-filter-toggle ${showFilters ? "active" : ""}`}
          >
            필터{" "}
            {selectedFilterCount > 0 && (
              <span className="filter-count">{selectedFilterCount}</span>
            )}
          </button>
          <select
            className="sort-select"
            value={sortType}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 선택된 필터 태그 */}
      {selectedFilterTags.length > 0 && (
        <div className="selected-filters">
          {selectedFilterTags.map((tag, index) => (
            <span
              key={`${tag.type}-${tag.value}-${index}`}
              className="filter-tag"
            >
              {tag.label}
              <button onClick={() => removeFilterTag(tag.type, tag.value)}>
                ×
              </button>
            </span>
          ))}
          <button onClick={handleResetFilters} className="btn-clear-all">
            전체 초기화
          </button>
        </div>
      )}

      {/* 필터 패널 */}
      {showFilters && (
        <div className="filter-panel">
          {/* 지역 필터 */}
          <div
            className={`filter-section ${
              expandedSections.region ? "expanded" : ""
            }`}
          >
            <div
              className="filter-section-header"
              onClick={() => toggleSection("region")}
            >
              <h3>지역</h3>
              <span className="toggle-icon">▼</span>
            </div>
            {expandedSections.region && (
              <div className="filter-section-content">
                <div className="region-filter-grid">
                  <div className="main-region-list">
                    {mainRegions.map((main) => (
                      <button
                        key={main.value}
                        className={`main-region-item ${
                          selectedMainRegion === main.value ? "active" : ""
                        }`}
                        onClick={() => setSelectedMainRegion(main.value)}
                      >
                        {main.label}
                        {regionCounts[main.value] && (
                          <span className="count">
                            ({regionCounts[main.value]})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedMainRegion && (
                    <div className="sub-region-grid">
                      {getSubRegions(selectedMainRegion).map((sub) => (
                        <label key={sub.value} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={filters.regions.includes(sub.value)}
                            onChange={() =>
                              handleFilterChange("regions", sub.value)
                            }
                          />
                          <span className="checkbox-text">{sub.label}</span>
                        </label>
                      ))}
                      <button
                        className="btn-select-all"
                        onClick={() => {
                          const subRegions = getSubRegions(selectedMainRegion);
                          const allSelected = subRegions.every((sub) =>
                            filters.regions.includes(sub.value)
                          );
                          if (allSelected) {
                            setFilters((prev) => ({
                              ...prev,
                              regions: prev.regions.filter(
                                (r) =>
                                  !subRegions.some((sub) => sub.value === r)
                              ),
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              regions: [
                                ...new Set([
                                  ...prev.regions,
                                  ...subRegions.map((sub) => sub.value),
                                ]),
                              ],
                            }));
                          }
                        }}
                      >
                        전체선택
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 경력 필터 */}
          <div
            className={`filter-section ${
              expandedSections.career ? "expanded" : ""
            }`}
          >
            <div
              className="filter-section-header"
              onClick={() => toggleSection("career")}
            >
              <h3>경력</h3>
              <span className="toggle-icon">▼</span>
            </div>
            {expandedSections.career && (
              <div className="filter-section-content">
                <div className="checkbox-group">
                  {careerTypes.map((type) => (
                    <label key={type.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.careerType.includes(type.value)}
                        onChange={() =>
                          handleFilterChange("careerType", type.value)
                        }
                      />
                      <span className="checkbox-text">{type.label}</span>
                    </label>
                  ))}
                </div>
                {filters.careerType.includes("경력") && (
                  <div className="checkbox-group" style={{ marginTop: "12px" }}>
                    {careerYears.map((year) => (
                      <label key={year.value} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.careerYears.includes(year.value)}
                          onChange={() =>
                            handleFilterChange("careerYears", year.value)
                          }
                        />
                        <span className="checkbox-text">{year.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 학력 필터 */}
          <div
            className={`filter-section ${
              expandedSections.education ? "expanded" : ""
            }`}
          >
            <div
              className="filter-section-header"
              onClick={() => toggleSection("education")}
            >
              <h3>학력</h3>
              <span className="toggle-icon">▼</span>
            </div>
            {expandedSections.education && (
              <div className="filter-section-content">
                <div className="checkbox-group">
                  <label className="checkbox-item highlight">
                    <input
                      type="checkbox"
                      checked={filters.educationExclude}
                      onChange={(e) => {
                        handleSingleFilterChange(
                          "educationExclude",
                          e.target.checked
                        );
                        if (e.target.checked) {
                          handleSingleFilterChange("education", "");
                        }
                      }}
                    />
                    <span className="checkbox-text">학력무관</span>
                  </label>
                </div>
                <div className="radio-group" style={{ marginTop: "12px" }}>
                  {educationLevels.map((level) => (
                    <label key={level.value} className="radio-item">
                      <input
                        type="radio"
                        name="education"
                        value={level.value}
                        checked={filters.education === level.value}
                        disabled={filters.educationExclude}
                        onChange={(e) =>
                          handleSingleFilterChange("education", e.target.value)
                        }
                      />
                      <span>{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 급여 필터 */}
          <div
            className={`filter-section ${
              expandedSections.salary ? "expanded" : ""
            }`}
          >
            <div
              className="filter-section-header"
              onClick={() => toggleSection("salary")}
            >
              <h3>급여</h3>
              <span className="toggle-icon">▼</span>
            </div>
            {expandedSections.salary && (
              <div className="filter-section-content">
                <div className="radio-group">
                  {salaryRanges.map((range) => (
                    <label key={range.value} className="radio-item">
                      <input
                        type="radio"
                        name="salaryMin"
                        value={range.value}
                        checked={filters.salaryMin === range.value}
                        onChange={(e) =>
                          handleSingleFilterChange("salaryMin", e.target.value)
                        }
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 업종/기업형태 필터 */}
          <div
            className={`filter-section ${
              expandedSections.industry ? "expanded" : ""
            }`}
          >
            <div
              className="filter-section-header"
              onClick={() => toggleSection("industry")}
            >
              <h3>업종 / 기업형태</h3>
              <span className="toggle-icon">▼</span>
            </div>
            {expandedSections.industry && (
              <div className="filter-section-content">
                <h4
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "12px",
                  }}
                >
                  업종
                </h4>
                <div className="checkbox-group">
                  {industries.map((item) => (
                    <label key={item.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.industries.includes(item.value)}
                        onChange={() =>
                          handleFilterChange("industries", item.value)
                        }
                      />
                      <span className="checkbox-text">{item.label}</span>
                    </label>
                  ))}
                </div>
                <h4
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "20px 0 12px",
                  }}
                >
                  기업형태
                </h4>
                <div className="checkbox-group">
                  {companyTypes.map((item) => (
                    <label key={item.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.companyTypes.includes(item.value)}
                        onChange={() =>
                          handleFilterChange("companyTypes", item.value)
                        }
                      />
                      <span className="checkbox-text">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 근무형태 필터 */}
          <div
            className={`filter-section ${
              expandedSections.workType ? "expanded" : ""
            }`}
          >
            <div
              className="filter-section-header"
              onClick={() => toggleSection("workType")}
            >
              <h3>근무형태 / 근무요일</h3>
              <span className="toggle-icon">▼</span>
            </div>
            {expandedSections.workType && (
              <div className="filter-section-content">
                <h4
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "12px",
                  }}
                >
                  근무형태
                </h4>
                <div className="checkbox-group">
                  {workTypes.map((item) => (
                    <label key={item.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.workTypes.includes(item.value)}
                        onChange={() =>
                          handleFilterChange("workTypes", item.value)
                        }
                      />
                      <span className="checkbox-text">{item.label}</span>
                    </label>
                  ))}
                </div>
                <h4
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "20px 0 12px",
                  }}
                >
                  근무요일
                </h4>
                <div className="checkbox-group">
                  {workDays.map((item) => (
                    <label key={item.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.workDays.includes(item.value)}
                        onChange={() =>
                          handleFilterChange("workDays", item.value)
                        }
                      />
                      <span className="checkbox-text">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 필터 버튼 */}
          <div className="filter-actions">
            <button onClick={handleResetFilters} className="btn-reset">
              초기화
            </button>
            <button onClick={handleApplyFilters} className="btn-apply">
              필터 적용
            </button>
          </div>
        </div>
      )}

      {/* 채용공고 목록 */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>채용공고를 불러오는 중...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 조건으로 검색해 보세요</p>
          <button onClick={handleResetFilters} className="btn-reset-large">
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div
              key={job.postId}
              className="job-card"
              onClick={() => handleJobClick(job.postId)}
            >
              {/* 회사 로고 */}
              <div className="job-card-logo">
                {job.companyImage ? (
                  <img src={job.companyImage} alt={job.companyName} />
                ) : (
                  <div className="logo-placeholder">
                    {job.companyName?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* 채용 정보 */}
              <div className="job-card-content">
                <div className="job-card-header">
                  <span className="company-name">{job.companyName}</span>
                  <div className="job-badges">
                    {job.isNew && <span className="badge badge-new">NEW</span>}
                    {job.isDeadlineSoon && (
                      <span className="badge badge-deadline">마감임박</span>
                    )}
                  </div>
                </div>

                <h3 className="job-title">{job.title}</h3>

                <div className="job-info">
                  <span>📍 {getRegionLabel(job.jobRegion)}</span>
                  <span>💼 {formatCareerType(job.jobCareerType)}</span>
                  <span className="salary">
                    💰 {formatSalary(job.jobSalaryMin, job.jobSalaryMax)}
                  </span>
                </div>

                <div className="job-card-footer">
                  <div className="job-meta">
                    <span>👁 {job.viewCnt || 0}</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  {job.jobDeadline && (
                    <span
                      className={`dday ${job.isDeadlineSoon ? "urgent" : ""}`}
                    >
                      D-{job.daysLeft}
                    </span>
                  )}
                </div>
              </div>

              {/* 북마크 */}
              <div className="job-card-actions">
                <button
                  className={`btn-bookmark ${job.isBookmarked ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: 북마크 토글 API 호출
                  }}
                >
                  {job.isBookmarked ? "★" : "☆"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && jobs.length > 0 && renderPagination()}
    </div>
  );
};

export default BoardJobPage;
