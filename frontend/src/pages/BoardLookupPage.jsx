import "./BoardLookupPage.css";
import SearchIcon from '../assets/search.png';
import { useState } from 'react';
import { tagData, tagSearchMap } from '../database/taglist';

// 예시 더미 데이터 (나중에 API로부터 받아올 데이터)
const dummyPosts = [
  { id: 1, title: '모던한 스타일의 포트폴리오', author: '김디자인', 
    imageUrl: 
    'https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c9086113b190f7f224.png?resize=1024x768' },
  { id: 2, title: '미니멀리즘 웹사이트 디자인', author: '이개발', imageUrl:
    'https://cdn.dribbble.com/userupload/12159483/file/original-958e42103d1f4ce4f3f15c7a56111a43.png?resize=1024x768' },
  { id: 3, title: '화려한 색감의 앱 UI', author: '박기획', imageUrl: 
    'https://cdn.dribbble.com/userupload/12313963/file/original-45c3d49e6f328a1309d29b2e4281f621.png?resize=1024x768' },
  { id: 4, title: '타이포그래피 중심 포스터', author: '최아트', imageUrl:
    'https://cdn.dribbble.com/userupload/12838339/file/original-d6a1302b141d8eca551e18d356880816.jpg?resize=1024x768' },
  { id: 5, title: '3D 렌더링 캐릭터', author: '정모델', imageUrl: 
    'https://cdn.dribbble.com/userupload/12403606/file/original-85885a06806950275a89f417e813f8d3.png?resize=1024x768' },
  { id: 6, title: '레트로 스타일 로고 디자인', author: '조브랜드', imageUrl: 
    'https://cdn.dribbble.com/userupload/12961845/file/original-298e8206917639f7596f1345c225301a.png?resize=1024x768' },
  { id: 7, title: '심플한 라인 아이콘 세트', author: '윤아이콘', imageUrl:
    'https://cdn.dribbble.com/userupload/12937898/file/original-3e5f78234850d9904c6326601469e3a6.png?resize=1024x768' },
  { id: 8, title: '자연 친화적 패키지 디자인', author: '장패키지', imageUrl: 
    'https://cdn.dribbble.com/userupload/12866164/file/original-063a54d48b795286591b72186b9f291e.png?resize=1024x768' },
];


function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const lowerCaseQuery = searchQuery.toLowerCase().trim();
  const filteredTagData = !lowerCaseQuery
    ? tagData
    : Object.keys(tagData).reduce((acc, category) => {
        const tags = tagData[category];
        const matchingTags = tags.filter(tag => {
          const lowerCaseTag = tag.toLowerCase();
          if (lowerCaseTag.includes(lowerCaseQuery)) {
            return true;
          }
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
    // 페이지 전체 레이아웃 (사이드바와 게시물 그리드를 포함)
    <div className="board-lookup-page">
      {/* 왼쪽 사이드바 영역: 태그 검색 및 선택 UI */}
      <div className="tag-box">
        <div className="tag-search-area">
          <input
            type="text"
            placeholder="Search tags..."
            className="tag-search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="tag-search-circle">
            <img src={SearchIcon} alt="Search Icon" className="search-icon"/>
          </div>
        </div>
        <div className="tag-categories-container">
          {Object.entries(filteredTagData).map(([category, tags]) => (
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

      {/* 오른쪽 게시물 그리드 영역 */}
      <main className="board-grid">
        {dummyPosts.map(post => (
          <div key={post.id} className="board-item">
            <img src={post.imageUrl} alt={post.title} className="board-item-thumbnail" />
            <div className="board-item-overlay">
              <div className="overlay-content">
                <h4 className="overlay-title">{post.title}</h4>
                <p className="overlay-author">{post.author}</p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default BoardLookupPage;