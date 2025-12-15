import React, { useState, useMemo, useEffect } from "react";
import regions from "../database/regions";
import "./BoardJobPage.css";

/* Debounce 훅 */
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* JobSearchFilter 컴포넌트 */
function JobSearchFilter({ onFilterChange }) {
  // 지역 선택
  const [showRegionPanel, setShowRegionPanel] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState("seoul");
  const [selectedDistricts, setSelectedDistricts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // 경력 선택
  const [showCareerPanel, setShowCareerPanel] = useState(false);
  const [careerType, setCareerType] = useState([]); // ['신입', '경력', '경력무관']
  const [careerYears, setCareerYears] = useState([]);

  // 학력 선택
  const [showEducationPanel, setShowEducationPanel] = useState(false);
  const [educationType, setEducationType] = useState(null);
  const [educationExclude, setEducationExclude] = useState(false);

  // 상세조건
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // 현재 선택된 지역 객체
  const selectedRegion = useMemo(
    () => regions.find((r) => r.id === selectedRegionId) || regions[0],
    [selectedRegionId]
  );

  // 필터링된 하위 지역
  const filteredDistricts = useMemo(() => {
    const districts = selectedRegion?.children || [];
    if (!debouncedQuery) return districts;
    const q = debouncedQuery.toLowerCase();
    return districts.filter((d) => d.name.toLowerCase().includes(q));
  }, [selectedRegion, debouncedQuery]);

  // 전체 선택 체크 여부
  const isAllSelected = useMemo(() => {
    const districtIds = (selectedRegion?.children || []).map((d) => d.id);
    return districtIds.length > 0 && districtIds.every((id) => selectedDistricts[id]);
  }, [selectedRegion, selectedDistricts]);

  // 선택된 지역 개수
  const selectedCount = useMemo(() => {
    return Object.keys(selectedDistricts).filter((key) => selectedDistricts[key]).length;
  }, [selectedDistricts]);

  // 지역 전체 선택/해제
  function toggleAllDistricts() {
    const districtIds = (selectedRegion?.children || []).map((d) => d.id);
    if (isAllSelected) {
      setSelectedDistricts((prev) => {
        const next = { ...prev };
        districtIds.forEach((id) => delete next[id]);
        return next;
      });
    } else {
      setSelectedDistricts((prev) => {
        const next = { ...prev };
        districtIds.forEach((id) => (next[id] = true));
        return next;
      });
    }
  }

  // 개별 지역 선택/해제
  function toggleDistrict(districtId) {
    setSelectedDistricts((prev) => {
      const next = { ...prev };
      if (next[districtId]) {
        delete next[districtId];
      } else {
        next[districtId] = true;
      }
      return next;
    });
  }

  // 지역 초기화
  function resetRegion() {
    const districtIds = (selectedRegion?.children || []).map((d) => d.id);
    setSelectedDistricts((prev) => {
      const next = { ...prev };
      districtIds.forEach((id) => delete next[id]);
      return next;
    });
  }

  // 경력 타입 토글
  function toggleCareerType(type) {
    setCareerType((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }

  // 경력 연차 토글
  function toggleCareerYear(year) {
    setCareerYears((prev) => {
      if (prev.includes(year)) {
        return prev.filter((y) => y !== year);
      } else {
        return [...prev, year];
      }
    });
  }

  // 경력 선택 초기화
  function resetCareer() {
    setCareerType([]);
    setCareerYears([]);
  }

  // 학력 선택 초기화
  function resetEducation() {
    setEducationType(null);
    setEducationExclude(false);
  }

  // 검색 실행
  function handleSearch() {
    const filters = {
      regions: Object.keys(selectedDistricts).filter((key) => selectedDistricts[key]),
      careerType,
      careerYears,
      education: educationType,
      educationExclude,
    };
    
    if (onFilterChange) {
      onFilterChange(filters);
    }
    console.log("검색 필터:", filters);
  }

  return (
    <div className="job-search-filter">
      {/* 필터 버튼 영역 */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${showRegionPanel ? "active" : ""}`}
          onClick={() => {
            setShowRegionPanel(!showRegionPanel);
            setShowCareerPanel(false);
            setShowEducationPanel(false);
            setShowAdvancedPanel(false);
          }}
        >
          📍 지역 선택 {showRegionPanel ? "▲" : "▼"}
        </button>

        <button
          className={`filter-btn ${showCareerPanel ? "active" : ""}`}
          onClick={() => {
            setShowCareerPanel(!showCareerPanel);
            setShowRegionPanel(false);
            setShowEducationPanel(false);
            setShowAdvancedPanel(false);
          }}
        >
          💼 경력 선택 {showCareerPanel ? "▲" : "▼"}
        </button>

        <button
          className={`filter-btn ${showEducationPanel ? "active" : ""}`}
          onClick={() => {
            setShowEducationPanel(!showEducationPanel);
            setShowRegionPanel(false);
            setShowCareerPanel(false);
            setShowAdvancedPanel(false);
          }}
        >
          🎓 학력 선택 {showEducationPanel ? "▲" : "▼"}
        </button>

        <button
          className={`filter-btn ${showAdvancedPanel ? "active" : ""}`}
          onClick={() => {
            setShowAdvancedPanel(!showAdvancedPanel);
            setShowRegionPanel(false);
            setShowCareerPanel(false);
            setShowEducationPanel(false);
          }}
        >
          ⚙️ 상세조건 {showAdvancedPanel ? "▲" : "▼"}
        </button>

        <div className="filter-right">
          <button className="search-btn" onClick={handleSearch}>
            검색하기
          </button>
        </div>
      </div>

      {/* 지역 선택 패널 */}
      {showRegionPanel && (
        <div className="filter-panel region-panel">
          <div className="region-layout">
            {/* 좌측: 광역시 리스트 */}
            <div className="region-list">
              {regions.map((region) => (
                <button
                  key={region.id}
                  className={`region-item ${selectedRegionId === region.id ? "active" : ""}`}
                  onClick={() => setSelectedRegionId(region.id)}
                >
                  <span className="region-name">{region.name}</span>
                  <span className="region-count">(0)</span>
                </button>
              ))}
            </div>

            {/* 우측: 하위 지역 선택 */}
            <div className="district-area">
              <div className="district-header">
                <label className="district-all">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAllDistricts}
                  />
                  <strong>{selectedRegion.name} 전체</strong>
                </label>
                <button className="district-reset" onClick={resetRegion}>
                  지역 초기화
                </button>
              </div>

              {/* 지역 검색 입력 */}
              <div className="district-search">
                <input
                  type="text"
                  placeholder="지역명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="district-search-input"
                />
              </div>

              <div className="district-grid">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((district) => (
                    <label key={district.id} className="district-item">
                      <input
                        type="checkbox"
                        checked={!!selectedDistricts[district.id]}
                        onChange={() => toggleDistrict(district.id)}
                      />
                      <span>{district.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-results">검색 결과가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 경력 선택 패널 */}
      {showCareerPanel && (
        <div className="filter-panel career-panel">
          <h3>경력 전체</h3>

          <div className="career-type-row">
            <label>
              <input
                type="checkbox"
                checked={careerType.includes("신입")}
                onChange={() => toggleCareerType("신입")}
              />
              <span>신입</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={careerType.includes("경력")}
                onChange={() => toggleCareerType("경력")}
              />
              <span>경력</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={careerType.includes("경력무관")}
                onChange={() => toggleCareerType("경력무관")}
              />
              <span>경력무관</span>
            </label>
          </div>

          <div className="career-years-grid">
            {[
              "~1년", "1년", "2년", "3년", "4년",
              "5년", "6년", "7년", "8년", "9년",
              "10년", "11년", "12년", "13년", "14년",
              "15년", "16년", "17년", "18년", "19년",
              "20년", "20년~"
            ].map((year) => (
              <button
                key={year}
                className={`career-year-btn ${careerYears.includes(year) ? "active" : ""}`}
                onClick={() => toggleCareerYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="panel-footer">
            <button className="reset-btn" onClick={resetCareer}>
              선택 초기화 ↻
            </button>
            <button className="close-btn" onClick={() => setShowCareerPanel(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 학력 선택 패널 */}
      {showEducationPanel && (
        <div className="filter-panel education-panel">
          <h3>학력 전체</h3>

          <div className="education-exclude">
            <label>
              <input
                type="checkbox"
                checked={educationExclude}
                onChange={(e) => setEducationExclude(e.target.checked)}
              />
              <span>학력무관</span>
            </label>
          </div>

          <div className="education-grid">
            {[
              { id: "high_below", label: "고교 졸업\n이하" },
              { id: "high", label: "고등학교\n졸업" },
              { id: "college_2_3", label: "대학 졸업\n(2,3년제)" },
              { id: "university", label: "대학교 졸업\n(4년제)" },
              { id: "master", label: "대학원 석사\n졸업" },
              { id: "doctor", label: "대학원 박사\n졸업" },
              { id: "doctor_above", label: "박사 졸업\n이상" }
            ].map((edu) => (
              <button
                key={edu.id}
                className={`education-btn ${educationType === edu.id ? "active" : ""}`}
                onClick={() => setEducationType(educationType === edu.id ? null : edu.id)}
              >
                {edu.label.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < edu.label.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </button>
            ))}
          </div>

          <div className="panel-footer">
            <button className="reset-btn" onClick={resetEducation}>
              선택 초기화 ↻
            </button>
            <button className="close-btn" onClick={() => setShowEducationPanel(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 상세조건 패널 */}
      {showAdvancedPanel && (
        <div className="filter-panel advanced-panel">
          <p>상세조건 패널 (추후 구현)</p>
        </div>
      )}

      {/* 하단 선택 카운트 */}
      <div className="filter-footer">
        <span className="selected-count">선택된 {selectedCount}건</span>
      </div>
    </div>
  );
}

/* JobCard 컴포넌트 */
function JobCard({ job }) {
  return (
    <div className="job-card">
      <div className="job-card-header">
        {job.company_logo && (
          <img src={job.company_logo} alt={job.company_name} className="company-logo" />
        )}
        <div className="company-info">
          <h4>{job.title}</h4>
          <p className="company-name">{job.company_name}</p>
        </div>
      </div>

      <div className="job-card-body">
        <div className="job-meta">
          <span className="job-location">📍 {job.location}</span>
          <span className="job-career">{job.career}</span>
          <span className="job-education">{job.education}</span>
        </div>
        <div className="job-salary">
          💰 {job.salary}
        </div>
      </div>

      <div className="job-card-footer">
        <span className="job-deadline">{job.deadline}</span>
        <button className="job-bookmark">⭐</button>
      </div>
    </div>
  );
}

/* JobList 컴포넌트 */
function JobList({ filters }) {
  // 실제로는 API 호출하여 필터링된 데이터를 가져옴
  const mockJobs = [
    {
      id: 1,
      title: "ULTRAFIT 헬디자인 신입",
      company_name: "(주)이노그루우",
      company_logo: null,
      location: "서울전체",
      career: "신입",
      education: "대졸",
      salary: "면접 시 50만원",
      deadline: "~01.01(목)",
    },
    {
      id: 2,
      title: "(주)올비메디텍 구매 담당 채용",
      company_name: "(주)올비메디텍",
      company_logo: null,
      location: "서울전체",
      career: "5년",
      education: "초대졸",
      salary: "면접 시 50만원",
      deadline: "~01.09(금)",
    },
    {
      id: 3,
      title: "편집디자이너 경력 채용",
      company_name: "(주)유니온뷰",
      company_logo: null,
      location: "서울전체",
      career: "경력",
      education: "고졸",
      salary: "면접 시 50만원",
      deadline: "~01.03(토)",
    },
  ];

  // filters를 활용한 필터링 로직 (실제로는 서버에서 처리)
  useEffect(() => {
    if (filters) {
      console.log("현재 적용된 필터:", filters);
      // 여기서 실제 API 호출
      // fetchJobs(filters).then(setJobs);
    }
  }, [filters]);

  return (
    <div className="job-list">
      <h3 className="job-list-title">이 공고, 놓치지 마세요!</h3>
      {filters && (
        <div className="applied-filters">
          {filters.regions?.length > 0 && (
            <span>지역: {filters.regions.length}개</span>
          )}
          {filters.careerType?.length > 0 && (
            <span>경력: {filters.careerType.join(", ")}</span>
          )}
          {filters.education && (
            <span>학력: {filters.education}</span>
          )}
        </div>
      )}
      <div className="job-grid">
        {mockJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

/* BoardJobPage 최상위 컴포넌트 */
function BoardJobPage() {
  const [filters, setFilters] = useState(null);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    console.log("필터 변경:", newFilters);
    // 여기서 API 호출하여 채용 공고 목록 새로 불러오기
  }

  return (
    <div className="board-job-page">
      <h1 className="page-title">채용 공고 검색</h1>
      <JobSearchFilter onFilterChange={handleFilterChange} />
      <JobList filters={filters} />
    </div>
  );
}

export default BoardJobPage;