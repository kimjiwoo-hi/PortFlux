// src/components/BoardJobPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import regions from "../database/regions"; // 경로: 이 파일이 src/components/ 에 있을 때 ../database/regions
import "./BoardJobPage.css";

/**
 * 이 파일은 RegionFilter 컴포넌트를 내부에 포함합니다.
 * - CSS는 BoardJobPage.css (너가 제공한 내용을 복사해서 저장)
 * - regions 데이터는 src/database/regions.js 에서 가져옵니다.
 *
 * 필요하면 RegionFilter를 별도 파일로 분리해서 import해도 됩니다.
 */

/* Debounce 훅 */
function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* RegionFilter 컴포넌트 (내부 포함) */
function RegionFilter({ onSearch }) {
  const [activeRegionId, setActiveRegionId] = useState(regions[0]?.id || null);
  const [query, setQuery] = useState("");
  const q = useDebounce(query, 220);

  const [selected, setSelected] = useState({});
  const [counts, setCounts] = useState({});

useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  (async () => {
    try {
      const res = await fetch("/api/region-count", { signal });
      if (!res.ok) throw new Error("no counts api");
      const data = await res.json();
      const map = {};
      data.forEach((item) => {
        map[item.region] = item.count;
      });
      setCounts(map);
    } catch (err) {
      if (err.name === 'AbortError') {
        // 요청이 취소된 경우: 무시
        return;
      }
      // 실제 에러는 로그로 남겨두면 문제 찾기 쉬움
      console.error('region-count fetch failed:', err);
    }
  })();

  return () => {
    controller.abort(); // 언마운트 시 fetch 취소
  };
}, []);


  const activeRegion = useMemo(
    () => regions.find((r) => r.id === activeRegionId) || regions[0],
    [activeRegionId]
  );

const children = useMemo(() => {
  return activeRegion?.children || [];
}, [activeRegion]);


  const filteredChildren = useMemo(() => {
    if (!q) return children;
    const qq = q.trim().toLowerCase();
    return children.filter((c) => {
      const name = (c.name || "").toLowerCase();
      return name.includes(qq) || (counts[c.id] && String(counts[c.id]).includes(qq));
    });
  }, [children, q, counts]);

  function toggleChild(childId) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[childId]) delete next[childId];
      else next[childId] = true;
      return next;
    });
  }

  function toggleRegionAll(region) {
    const ids = (region.children || []).map((c) => c.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected[id]);
    setSelected((prev) => {
      const next = { ...prev };
      if (allSelected) {
        ids.forEach((id) => delete next[id]);
      } else {
        ids.forEach((id) => {
          next[id] = true;
        });
      }
      return next;
    });
  }

  const selectedList = useMemo(() => {
    const map = {};
    regions.forEach((r) => (r.children || []).forEach((c) => (map[c.id] = { ...c, parentId: r.id, parentName: r.name })));
    return Object.keys(selected).map((id) => map[id]).filter(Boolean);
  }, [selected]);

  const selectedCount = selectedList.length;

  function removeTag(id) {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function clearAll() {
    setSelected({});
  }

  function handleSearch() {
    const ids = Object.keys(selected);
    if (onSearch) onSearch(ids);
    else console.log("검색:", ids);
  }

  return (
    <div className="rf-wrapper" role="region" aria-label="지역 필터">
      <div className="rf-top">
        <div className="rf-left-title">
          <span className="rf-pin">📍</span>
          <strong>지역</strong>
          <span className="rf-sub">({selectedList.length})</span>
          <div className="rf-selected-inline">
            {selectedList.length === 0 ? (
              <span className="muted">선택된 지역 없음</span>
            ) : (
              selectedList.map((s) => (
                <span key={s.id} className="rf-inline-tag">
                  {s.parentName} &gt; {s.name}
                  <button onClick={() => removeTag(s.id)} aria-label={`제거 ${s.name}`} className="tag-x">
                    ✕
                  </button>
                </span>
              ))
            )}
            {selectedList.length > 0 && (
              <button className="rf-clear" onClick={clearAll}>
                초기화
              </button>
            )}
          </div>
        </div>

        <div className="rf-searchbox">
          <input type="text" placeholder="지역명 입력" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && (
            <button className="clear-input" onClick={() => setQuery("")}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="rf-main">
        <div className="rf-col rf-col-left" role="list">
          {regions.map((r) => (
            <button key={r.id} className={`rf-region-btn ${r.id === activeRegionId ? "active" : ""}`} onClick={() => setActiveRegionId(r.id)}>
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        <div className="rf-col rf-col-center">
          <div className="rf-center-header">
            <label className="rf-checkbox-row">
              <input
                type="checkbox"
                checked={(activeRegion.children || []).length > 0 && (activeRegion.children || []).every((c) => selected[c.id])}
                onChange={() => toggleRegionAll(activeRegion)}
              />
              <strong>{activeRegion.name} 전체</strong>
            </label>

            <div className="muted small">지역 펼쳐보기 · 지역 초기화</div>
          </div>

          <div className="rf-children">
            {filteredChildren.length === 0 ? (
              <div className="rf-empty">검색 결과가 없습니다.</div>
            ) : (
              filteredChildren.map((child) => (
                <label key={child.id} className="rf-child">
                  <input type="checkbox" checked={!!selected[child.id]} onChange={() => toggleChild(child.id)} />
                  <span className="rf-child-name">{child.name}</span>
                  {counts[child.id] !== undefined && <span className="rf-count">({counts[child.id].toLocaleString()})</span>}
                </label>
              ))
            )}
          </div>
        </div>

        <div className="rf-col rf-col-right">
          <div className="rf-help">
            <div>
              <strong>팁</strong>
            </div>
            <div className="muted small">검색창에 지역명을 입력하면 실시간으로 필터됩니다.</div>
            <div className="muted small">전체 선택을 클릭하면 해당 광역의 모든 하위 지역을 토글합니다.</div>
          </div>
        </div>
      </div>

      <div className="rf-bottom">
        <div className="rf-bottom-left">
          {selectedList.length === 0 ? (
            <span className="muted">선택된 지역 없음</span>
          ) : (
            selectedList.map((s) => (
              <span key={s.id} className="rf-bottom-tag">
                {s.parentName} &gt; {s.name}
                <button className="tag-x" onClick={() => removeTag(s.id)}>
                  ✕
                </button>
              </span>
            ))
          )}
        </div>

        <div className="rf-bottom-right">
          <div className="rf-summary">
            <div className="selected-count">{selectedCount.toLocaleString()}</div>
            <div className="selected-label">선택된</div>
          </div>
          <button className="rf-search-btn" onClick={handleSearch}>
            검색하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* BoardJobPage 최상위 컴포넌트 */
function BoardJobPage() {
  function handleSearch(selectedIds) {
    // 여기에서 서버 호출 또는 라우팅 처리
    console.log("BoardJobPage - 선택된 지역들:", selectedIds);
  }

  return (
    <div className="board-job-page">
      {/* 예: 상단 헤더 자리 */}
      <div style={{ marginBottom: 16 }}>
        <h2>채용 공고 검색</h2>
      </div>

      {/* RegionFilter 삽입 (header/footer 사이에 넣기 적합) */}
      <RegionFilter onSearch={handleSearch} />

      {/* 아래에 공고 리스트, 페이징 등 추가 */}
      <div style={{ marginTop: 20 }}>
        {/* TODO: 검색 결과 영역 */}
      </div>
    </div>
  );
}

export default BoardJobPage;
