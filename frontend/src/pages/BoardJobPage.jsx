import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getJobs,
  getJobCountByRegion,
  isCompanyUser,
  isLoggedIn,
  toggleBookmark,
} from "../api/jobApi";
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

  // 기업회원 여부 상태
  const [isCompany, setIsCompany] = useState(false);

  // 북마크 로딩 상태 (postId별)
  const [bookmarkLoading, setBookmarkLoading] = useState({});

  // 페이징
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

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

  // URL에서 상태로 동기화 (뒤로가기/앞으로가기 대응)
  useEffect(() => {
    try {
      const urlString = searchParams.toString();
      console.log(
        "🔄 [" +
          new Date().getMilliseconds() +
          "ms] searchParams 변경 감지, 전체 URL:",
        urlString
      );

      const keyword = searchParams.get("keyword") || "";
      const sort = searchParams.get("sort") || "latest";
      const page = parseInt(searchParams.get("page")) || 0;

      // 필터 파라미터 파싱
      const regions = searchParams.get("regions")
        ? JSON.parse(searchParams.get("regions"))
        : [];
      const careerType = searchParams.get("careerType")
        ? JSON.parse(searchParams.get("careerType"))
        : [];
      const careerYears = searchParams.get("careerYears")
        ? JSON.parse(searchParams.get("careerYears"))
        : [];
      const education = searchParams.get("education") || "";
      const educationExclude = searchParams.get("educationExclude") === "true";
      const industries = searchParams.get("industries")
        ? JSON.parse(searchParams.get("industries"))
        : [];
      const companyTypes = searchParams.get("companyTypes")
        ? JSON.parse(searchParams.get("companyTypes"))
        : [];
      const workTypes = searchParams.get("workTypes")
        ? JSON.parse(searchParams.get("workTypes"))
        : [];
      const workDays = searchParams.get("workDays")
        ? JSON.parse(searchParams.get("workDays"))
        : [];
      const salaryMin = searchParams.get("salaryMin") || "";

      console.log("📍 URL에서 읽은 값:", { page, sort, keyword });
      console.log("🎯 현재 상태:", { currentPage, sortType });

      // 변경사항이 있을 때만 상태 업데이트
      if (currentPage !== page) {
        console.log("  → currentPage 변경:", currentPage, "→", page);
        setCurrentPage(page);
      }

      if (sortType !== sort) {
        console.log("  → sortType 변경:", sortType, "→", sort);
        setSortType(sort);
      }

      const newFiltersString = JSON.stringify({
        keyword,
        regions,
        careerType,
        careerYears,
        education,
        educationExclude,
        industries,
        companyTypes,
        workTypes,
        workDays,
        salaryMin,
      });
      const currentFiltersString = JSON.stringify(filters);

      if (newFiltersString !== currentFiltersString) {
        console.log("  → filters 변경");
        setFilters({
          keyword,
          regions,
          careerType,
          careerYears,
          education,
          educationExclude,
          industries,
          companyTypes,
          workTypes,
          workDays,
          salaryMin,
        });
      }

      console.log("✅ 상태 동기화 완료");
    } catch (error) {
      console.error("URL 파라미터 파싱 오류:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // searchParams 변경 시에만 실행

  // 기업회원 확인 로직 (jobApi의 isCompanyUser 유틸리티 사용)
  useEffect(() => {
    setIsCompany(isCompanyUser());
  }, []);

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

  // 채용공고 목록 조회 - URL 기반으로 직접 호출
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        // 디버깅: 요청 파라미터 로그
        console.log("=== 채용공고 목록 조회 ===");
        console.log(
          "페이지:",
          currentPage,
          "(0-based, 실제 페이지:",
          currentPage + 1 + ")"
        );
        console.log("페이지 크기:", pageSize);
        console.log("정렬:", sortType);
        console.log("필터:", filters);
        console.log("계산된 OFFSET:", currentPage * pageSize);

        const data = await getJobs(filters, currentPage, pageSize, sortType);

        console.log("응답 데이터:", {
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.page,
          receivedItems: data.content?.length,
        });

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
    };

    console.log(
      "🚀 fetchJobs 실행 - currentPage:",
      currentPage,
      "sortType:",
      sortType
    );
    fetchJobs();
  }, [filters, currentPage, sortType]); // 상태가 변경될 때마다 실행

  // 북마크 토글 핸들러
  const handleBookmarkToggle = useCallback(
    async (e, postId) => {
      e.stopPropagation(); // 카드 클릭 이벤트 전파 방지

      // 로그인 여부 확인
      if (!isLoggedIn()) {
        alert("로그인이 필요합니다.");
        navigate("/login", { state: { from: "/boardjob" } });
        return;
      }

      // 이미 로딩 중이면 무시
      if (bookmarkLoading[postId]) return;

      try {
        setBookmarkLoading((prev) => ({ ...prev, [postId]: true }));

        const result = await toggleBookmark(postId);

        // 성공 시 해당 job의 isBookmarked 상태 업데이트
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.postId === postId
              ? { ...job, isBookmarked: result.bookmarked }
              : job
          )
        );
      } catch (error) {
        console.error("북마크 처리 실패:", error);

        if (
          error.message?.includes("401") ||
          error.message?.includes("로그인")
        ) {
          alert("로그인이 필요합니다.");
          navigate("/login", { state: { from: "/boardjob" } });
        } else {
          alert("북마크 처리 중 오류가 발생했습니다.");
        }
      } finally {
        setBookmarkLoading((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [bookmarkLoading, navigate]
  );

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
    const params = new URLSearchParams();

    // 필터 정보를 URL에 저장
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.regions.length > 0)
      params.set("regions", JSON.stringify(filters.regions));
    if (filters.careerType.length > 0)
      params.set("careerType", JSON.stringify(filters.careerType));
    if (filters.careerYears.length > 0)
      params.set("careerYears", JSON.stringify(filters.careerYears));
    if (filters.education) params.set("education", filters.education);
    if (filters.educationExclude) params.set("educationExclude", "true");
    if (filters.industries.length > 0)
      params.set("industries", JSON.stringify(filters.industries));
    if (filters.companyTypes.length > 0)
      params.set("companyTypes", JSON.stringify(filters.companyTypes));
    if (filters.workTypes.length > 0)
      params.set("workTypes", JSON.stringify(filters.workTypes));
    if (filters.workDays.length > 0)
      params.set("workDays", JSON.stringify(filters.workDays));
    if (filters.salaryMin) params.set("salaryMin", filters.salaryMin);

    // 현재 정렬 유지
    if (sortType !== "latest") params.set("sort", sortType);

    // 페이지는 1페이지로 리셋
    setSearchParams(params);
  }, [filters, sortType, setSearchParams]);

  // 필터 초기화
  const handleResetFilters = useCallback(() => {
    // 상태를 초기값으로 직접 리셋
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
    setSortType("latest");
    setCurrentPage(0);
    // URL도 초기화
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // 정렬 변경
  const handleSortChange = useCallback(
    (newSort) => {
      const params = new URLSearchParams(searchParams);
      if (newSort !== "latest") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }
      params.delete("page"); // 정렬 변경 시 1페이지로
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  // 페이지 변경
  const handlePageChange = useCallback(
    (newPage) => {
      console.log("🔘 페이지 변경 요청:", newPage);

      // 현재 URL 파라미터를 그대로 사용
      const params = new URLSearchParams(searchParams);

      if (newPage > 0) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }

      const newParamsString = params.toString();
      const currentParamsString = searchParams.toString();

      console.log("현재 URL:", currentParamsString);
      console.log("새 URL:", newParamsString);

      // URL이 실제로 변경되는 경우에만 업데이트
      if (newParamsString !== currentParamsString) {
        setSearchParams(params, { replace: false });
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams]
  );

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
  const removeFilterTag = useCallback(
    (filterName, value) => {
      const newFilters = { ...filters };

      if (Array.isArray(newFilters[filterName])) {
        newFilters[filterName] = newFilters[filterName].filter(
          (v) => v !== value
        );
      } else {
        newFilters[filterName] = filterName === "educationExclude" ? false : "";
      }

      // URL 업데이트
      const params = new URLSearchParams();
      if (newFilters.keyword) params.set("keyword", newFilters.keyword);
      if (newFilters.regions.length > 0)
        params.set("regions", JSON.stringify(newFilters.regions));
      if (newFilters.careerType.length > 0)
        params.set("careerType", JSON.stringify(newFilters.careerType));
      if (newFilters.careerYears.length > 0)
        params.set("careerYears", JSON.stringify(newFilters.careerYears));
      if (newFilters.education) params.set("education", newFilters.education);
      if (newFilters.educationExclude) params.set("educationExclude", "true");
      if (newFilters.industries.length > 0)
        params.set("industries", JSON.stringify(newFilters.industries));
      if (newFilters.companyTypes.length > 0)
        params.set("companyTypes", JSON.stringify(newFilters.companyTypes));
      if (newFilters.workTypes.length > 0)
        params.set("workTypes", JSON.stringify(newFilters.workTypes));
      if (newFilters.workDays.length > 0)
        params.set("workDays", JSON.stringify(newFilters.workDays));
      if (newFilters.salaryMin) params.set("salaryMin", newFilters.salaryMin);
      if (sortType !== "latest") params.set("sort", sortType);
      if (currentPage > 0) params.set("page", currentPage.toString());

      setSearchParams(params);
    },
    [filters, sortType, currentPage, setSearchParams]
  );

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
      tags.push({
        type: "careerType",
        value: v,
        label: careerTypes.find((t) => t.value === v)?.label || v,
      })
    );
    filters.careerYears.forEach((v) =>
      tags.push({
        type: "careerYears",
        value: v,
        label: careerYears.find((y) => y.value === v)?.label || v,
      })
    );
    if (filters.education) {
      tags.push({
        type: "education",
        value: filters.education,
        label: getEducationLabel(filters.education),
      });
    }
    if (filters.educationExclude) {
      tags.push({
        type: "educationExclude",
        value: true,
        label: "학력 무관",
      });
    }
    filters.industries.forEach((v) =>
      tags.push({
        type: "industries",
        value: v,
        label: industries.find((i) => i.value === v)?.label || v,
      })
    );
    filters.companyTypes.forEach((v) =>
      tags.push({
        type: "companyTypes",
        value: v,
        label: companyTypes.find((c) => c.value === v)?.label || v,
      })
    );
    filters.workTypes.forEach((v) =>
      tags.push({
        type: "workTypes",
        value: v,
        label: workTypes.find((w) => w.value === v)?.label || v,
      })
    );
    filters.workDays.forEach((v) =>
      tags.push({
        type: "workDays",
        value: v,
        label: workDays.find((d) => d.value === v)?.label || v,
      })
    );
    if (filters.salaryMin) {
      tags.push({
        type: "salaryMin",
        value: filters.salaryMin,
        label:
          salaryRanges.find((s) => s.value === filters.salaryMin)?.label ||
          filters.salaryMin,
      });
    }
    return tags;
  }, [filters]);

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      0,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button
          className="btn-page"
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
        >
          ««
        </button>
        <button
          className="btn-page"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          «
        </button>

        {startPage > 0 && <span className="pagination-ellipsis">...</span>}

        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`btn-page ${currentPage === page ? "active" : ""}`}
            onClick={() => handlePageChange(page)}
          >
            {page + 1}
          </button>
        ))}

        {endPage < totalPages - 1 && (
          <span className="pagination-ellipsis">...</span>
        )}

        <button
          className="btn-page"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          »
        </button>
        <button
          className="btn-page"
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          »»
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
          <span className="total-count">총 {totalElements}건</span>
        </div>

        {/* 기업회원일 때만 버튼 표시 */}
        {isCompany && (
          <button className="btn-create-job" onClick={handleCreate}>
            + 채용공고 등록
          </button>
        )}
      </div>

      {/* 검색 섹션 */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="채용공고 검색..."
              value={filters.keyword}
              onChange={handleKeywordChange}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            />
            <button className="btn-search" onClick={handleApplyFilters}>
              검색
            </button>
          </div>
        </div>

        <div className="search-options">
          <button
            className={`btn-filter-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            필터
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
            <div
              key={`${tag.type}-${tag.value}-${index}`}
              className="filter-tag"
            >
              <span>{tag.label}</span>
              <button onClick={() => removeFilterTag(tag.type, tag.value)}>
                ×
              </button>
            </div>
          ))}
          <button className="btn-clear-all" onClick={handleResetFilters}>
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
                  {/* 상위 지역 */}
                  <div className="main-region-list">
                    {mainRegions.map((region) => (
                      <button
                        key={region.value}
                        className={`main-region-item ${
                          selectedMainRegion === region.value ? "active" : ""
                        }`}
                        onClick={() => setSelectedMainRegion(region.value)}
                      >
                        <span>{region.label}</span>
                        <span className="count">
                          {regionCounts[region.value] || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* 하위 지역 */}
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
                                  !subRegions.find((sub) => sub.value === r)
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
                        전체{" "}
                        {filters.regions.filter((r) =>
                          getSubRegions(selectedMainRegion).find(
                            (sub) => sub.value === r
                          )
                        ).length === getSubRegions(selectedMainRegion).length
                          ? "해제"
                          : "선택"}
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
                  <>
                    <h4
                      className="filter-subsection-title"
                      style={{ marginTop: "16px" }}
                    >
                      경력 연차
                    </h4>
                    <div className="checkbox-group">
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
                  </>
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
                <label className="checkbox-item highlight">
                  <input
                    type="checkbox"
                    checked={filters.educationExclude}
                    onChange={(e) =>
                      handleSingleFilterChange(
                        "educationExclude",
                        e.target.checked
                      )
                    }
                  />
                  <span className="checkbox-text">학력 무관</span>
                </label>
                <div className="radio-group">
                  {educationLevels.map((level) => (
                    <label key={level.value} className="radio-item">
                      <input
                        type="radio"
                        name="education"
                        checked={filters.education === level.value}
                        onChange={() =>
                          handleSingleFilterChange("education", level.value)
                        }
                        disabled={filters.educationExclude}
                      />
                      <span className="checkbox-text">{level.label}</span>
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
                <h4 className="filter-subsection-title">업종</h4>
                <div className="checkbox-group industry-grid">
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
                  className="filter-subsection-title"
                  style={{ marginTop: "16px" }}
                >
                  기업형태
                </h4>
                <div className="checkbox-group company-type-grid">
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
                <h4 className="filter-subsection-title">근무형태</h4>
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
                  className="filter-subsection-title"
                  style={{ marginTop: "16px" }}
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
                {job.companyLogo || job.companyImage ? (
                  <img
                    src={job.companyLogo || job.companyImage}
                    alt={job.companyName}
                  />
                ) : (
                  <div className="logo-placeholder">
                    {job.companyName?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* 채용 정보 */}
              <div className="job-card-content">
                <div className="job-card-header">
                  <div className="company-info-wrapper">
                    <span className="company-name">{job.companyName}</span>
                    {job.jobCompanyTypes?.length > 0 && (
                      <span className="company-type">
                        {job.jobCompanyTypes[0]}
                      </span>
                    )}
                  </div>
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
                  onClick={(e) => handleBookmarkToggle(e, job.postId)}
                  disabled={bookmarkLoading[job.postId]}
                  title={job.isBookmarked ? "북마크 해제" : "북마크 추가"}
                >
                  {bookmarkLoading[job.postId]
                    ? "..."
                    : job.isBookmarked
                    ? "★"
                    : "☆"}
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
