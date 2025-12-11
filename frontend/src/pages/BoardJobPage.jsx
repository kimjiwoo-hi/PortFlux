import React, { useState, useMemo, useEffect } from "react";
import regions from "../database/regions"; // 경로: 이 파일이 src/components/ 에 있을 때 ../database/regions
import "./BoardJobPage.css";

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
        if (err.name === "AbortError") {
          return;
        }
        console.error("region-count fetch failed:", err);
      }
    })();

    return () => {
      controller.abort();
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
          {/* 핀 삭제됨 */}
          <strong>지역</strong>
        </div>

        {/* rf-searchbox를 일반적인 flex 아이템으로 배치 (절대 위치 제거) */}
        <div className="rf-searchbox">
          <input
            type="text"
            placeholder="지역명 입력"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="지역 검색"
          />
          {query && (
            <button className="clear-input" onClick={() => setQuery("")} aria-label="입력 지우기">
              ×
            </button>
          )}

          {/* 검색 버튼을 searchbox 바깥으로 빼내어 rf-top의 마지막 flex 아이템으로 배치 */}
          {/* 이미지와 같이 버튼을 검색창 오른쪽에 붙이기 위해, 이 div를 rf-top 내부의 마지막 아이템으로 배치하는 것이 더 깔끔합니다. */}
        </div>
        
        {/* 검색 버튼을 rf-top의 직접적인 자식으로 배치하여, rf-left-title, rf-searchbox와 함께 flex 정렬되도록 수정 */}
        {/* rf-search-actions 대신 버튼만 직접 배치하여 HTML 구조 단순화 및 CSS flex 활용 */}
        <button className="rf-search-btn" onClick={handleSearch}>
          검색하기
        </button>
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

          <div className="rf-bottom-actions">
            {/* 숫자만 표시 (선택된 텍스트 제거) */}
            <div className="rf-summary rf-summary-bottom">
              <div className="selected-count">{selectedCount.toLocaleString()}</div>
            </div>

            {/* 초기화 버튼 - 선택이 있을 때만 렌더 */}
            {selectedCount > 0 && (
              <button
                type="button"
                className="rf-reset-btn rf-reset-btn-bottom"
                onClick={clearAll}
                aria-label="선택 초기화"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        <div className="rf-bottom-right" />
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
      <div style={{ marginBottom: 10 }}>
        <h2>채용 공고 검색</h2>
      </div>

      <RegionFilter onSearch={handleSearch} />

      <div style={{ marginTop: 10 }}>
        {/* TODO: 검색 결과 영역 */}
      </div>
    </div>
  );
}

export default BoardJobPage;