import "./BoardLookupPage.css";
import SearchIcon from "../assets/search.png";
import { useState } from "react";
import { tagData, tagSearchMap } from "../database/taglist";

const initialPosts = [
  {
    id: 1,
    title: "모던한 스타일의 포트폴리오",
    author: "김디자인",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768",
    likes: 125,
    views: 2400,
    isLiked: false,
  },
  {
    id: 2,
    title: "미니멀리즘 웹사이트 디자인",
    author: "이개발",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12159483/file/original-958e42103d1f4ce4f3f15c7a56111a43.png?resize=1024x768",
    likes: 99,
    views: 1800,
    isLiked: false,
  },
  {
    id: 3,
    title: "화려한 색감의 앱 UI",
    author: "박기획",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12313963/file/original-45c3d49e6f328a1309d29b2e4281f621.png?resize=1024x768",
    likes: 230,
    views: 3200,
    isLiked: false,
  },
  {
    id: 4,
    title: "타이포그래피 중심 포스터",
    author: "최아트",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12838339/file/original-d6a1302b141d8eca551e18d356880816.jpg?resize=1024x768",
    likes: 50,
    views: 980,
    isLiked: false,
  },
  {
    id: 5,
    title: "3D 렌더링 캐릭터",
    author: "정모델",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12403606/file/original-85885a06806950275a89f417e813f8d3.png?resize=1024x768",
    likes: 450,
    views: 8800,
    isLiked: false,
  },
  {
    id: 6,
    title: "레트로 스타일 로고 디자인",
    author: "조브랜드",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12961845/file/original-298e8206917639f7596f1345c225301a.png?resize=1024x768",
    likes: 88,
    views: 1500,
    isLiked: false,
  },
  {
    id: 7,
    title: "심플한 라인 아이콘 세트",
    author: "윤아이콘",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12937898/file/original-3e5f78234850d9904c6326601469e3a6.png?resize=1024x768",
    likes: 110,
    views: 2200,
    isLiked: false,
  },
  {
    id: 8,
    title: "자연 친화적 패키지 디자인",
    author: "장패키지",
    imageUrl:
      "https://cdn.dribbble.com/userupload/12866164/file/original-063a54d48b795286591b72186b9f291e.png?resize=1024x768",
    likes: 76,
    views: 1100,
    isLiked: false,
  },
];

function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [posts /*setPosts*/] = useState(initialPosts); // 게시물 목록 상태 관리

  const lowerCaseQuery = searchQuery.toLowerCase().trim();
  const filteredTagData = !lowerCaseQuery
    ? tagData
    : Object.keys(tagData).reduce((acc, category) => {
        const tags = tagData[category];
        const matchingTags = tags.filter((tag) => {
          const lowerCaseTag = tag.toLowerCase();
          if (lowerCaseTag.includes(lowerCaseQuery)) {
            return true;
          }
          const searchKeywords = tagSearchMap[lowerCaseTag];
          if (searchKeywords) {
            return searchKeywords.some((keyword) =>
              keyword.includes(lowerCaseQuery)
            );
          }
          return false;
        });
        if (matchingTags.length > 0) {
          acc[category] = matchingTags;
        }
        return acc;
      }, {});

  const handleTagChange = (category, tag) => {
    setSelectedTags((prev) => {
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

  /*
  const handleLikeClick = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;
        return { ...post, isLiked: !post.isLiked, likes: newLikes };
      }
      return post;
    }));
  };
  */

  return (
    <div className="board-lookup-page">
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
            <img src={SearchIcon} alt="Search Icon" className="search-icon" />
          </div>
        </div>
        <div className="tag-categories-container">
          {Object.entries(filteredTagData).map(([category, tags]) => (
            <div key={category} className="tag-category">
              <h3 className="tag-category-title">{category}</h3>
              <div className="tag-list">
                {tags.map((tag) => (
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

      <main className="board-grid">
        {postsToRender.map((post) =>
          post.type === "add-new" ? (
            <div
              key={post.id}
              className="board-item add-new-item"
              onClick={handleAddPostClick}
            >
              <div className="add-new-plus">+</div>
            </div>
          ) : (
            <div key={post.id} className="board-item">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="board-item-thumbnail"
              />
              <div className="board-item-info">
                <h4 className="info-title">{post.title}</h4>
                <a href={`/profile/${post.author}`} className="info-author">
                  {post.author}
                </a>
                {/* 
                  좋아요와 조횟수 부분 (현재 기능 구현 미완료로 인해 주석 처리됨 - 나중에 다시 작업할 예정)
                  <div className="item-stats">
                    <span className="stat-item" onClick={() => handleLikeClick(post.id)} style={{cursor: 'pointer'}}>
                      {post.isLiked ? '❤️' : '🤍'} {post.likes}
                    </span>
                    <span className="stat-item">👁️ {post.views}</span>
                  </div>
                */}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default BoardLookupPage;
