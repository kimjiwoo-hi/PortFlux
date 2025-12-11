import "./BoardLookupPage.css";
import SearchIcon from '../assets/search.png';
import { useState, useEffect } from 'react'; // useEffect 추가
import tagData from '../database/taglist'; // taglist.js에서 tagData를 가져옵니다.

// 한글/영문 검색을 위한 검색 맵
const tagSearchMap = {
  'javascript': ['javascript', '자바스크립트', '자바'],
  'python': ['python', '파이썬', '파이'],
  'java': ['java', '자바'],
  'typescript': ['typescript', '타입스크립트', '타입'],
  'c#': ['c#', 'csharp', '씨샵'],
  'c++': ['c++', 'cpp', '씨쁠쁠'],
  'go': ['go', '고'],
  'php': ['php', '피에이치피'],
  'kotlin': ['kotlin', '코틀린'],
  'swift': ['swift', '스위프트'],
  '프론트엔드': ['프론트엔드', 'frontend'],
  '백엔드': ['백엔드', 'backend'],
  '풀스택': ['풀스택', 'fullstack'],
  // 다른 태그들도 필요에 따라 추가 가능
};


function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 state
  const [filteredTagData, setFilteredTagData] = useState(tagData); // 필터링된 태그 state

  // 검색어가 변경될 때마다 태그를 필터링하는 로직
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();

    if (!lowerCaseQuery) {
      setFilteredTagData(tagData); // 검색어가 없으면 전체 태그 표시
      return;
    }

    const newFilteredData = {};

    Object.keys(tagData).forEach(category => {
      const tags = tagData[category];
      const matchingTags = tags.filter(tag => {
        const lowerCaseTag = tag.toLowerCase();

        // 1. 직접적인 태그 이름 포함 여부 확인 (e.g., 'java' in 'javascript')
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
        newFilteredData[category] = matchingTags;
      }
    });

    setFilteredTagData(newFilteredData);
  }, [searchQuery]);


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
          {Object.entries(filteredTagData).map(([category, tags]) => ( // filteredTagData 사용
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
