import "./BoardLookupPage.css";
import SearchIcon from '../assets/search.png';
import { useState } from 'react'; // useEffect 제거
import { tagData, tagSearchMap } from '../database/taglist'; // taglist.js에서 tagData와 tagSearchMap을 가져옵니다.


function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 state

  // 렌더링 시 직접 필터링된 데이터 계산
  const lowerCaseQuery = searchQuery.toLowerCase().trim();
  const filteredTagData = !lowerCaseQuery
    ? tagData // 검색어가 없으면 전체 데이터 사용
    : Object.keys(tagData).reduce((acc, category) => {
        const tags = tagData[category];
        const matchingTags = tags.filter(tag => {
          const lowerCaseTag = tag.toLowerCase();

          // 1. 직접적인 태그 이름 포함 여부 확인
          if (lowerCaseTag.includes(lowerCaseQuery)) {
            return true;
          }

          // 2. 검색 맵을 이용한 한/영 변환 검색
          const searchKeywords = tagSearchMap[lowerCaseTag];
          if (searchKeywords) {
            return searchKeywords.some(keyword => keyword.includes(lowerCaseQuery));
          }

          return false;
        });

        if (matchingTags.length > 0) {
          acc[category] = matchingTags;
        }
        return acc;
      }, {});


  const handleTagChange = (category, tag) => {
    setSelectedTags(prev => {
        const newCategoryTags = new Set(prev[category] || []);
        if (newCategoryTags.has(tag)) {
          newCategoryTags.delete(tag);
        } else {
          newCategoryTags.add(tag);
        }
        return {
          ...prev,
          [category]: Array.from(newCategoryTags),
        };
      });
    };

  return (
      <div className="tag-box">
        <div className="tag-search-area">
          <input
            type="text"
            placeholder="태그 검색 (e.g., 자바, Python)"
            className="tag-search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // 입력 시 searchQuery 업데이트
          />
          <div className="tag-search-circle">
            <img src={SearchIcon} alt="Search Icon" className="search-icon" />
          </div>
        </div>

        {/* --- 새로 추가될 태그 선택 부분 --- */}
        <div className="tag-categories-container">
          {Object.entries(filteredTagData).map(([category, tags]) => ( // 계산된 filteredTagData 사용
            <div key={category} className="tag-category">
              <h3 className="tag-category-title">{category}</h3>
              <div className="tag-list">
                {tags.map(tag => (
                  <label key={tag} className="tag-item">
                    <input
                      type="checkbox"
                      value={tag}
                      onChange={() => handleTagChange(category, tag)}
                      checked={(selectedTags[category] || []).includes(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}

export default BoardLookupPage;
