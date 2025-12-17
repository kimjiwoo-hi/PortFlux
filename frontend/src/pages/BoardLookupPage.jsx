import "./BoardLookupPage.css";
<<<<<<< HEAD
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
=======
import SearchIcon from '../assets/search.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tagData, tagSearchMap } from '../database/taglist';
import axios from 'axios';

function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, /*setIsLoggedIn*/] = useState(true); 
  const navigate = useNavigate();

  // 게시글 목록 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/boardlookup/posts', {
          withCredentials: true
        });
        
        // API 응답 데이터를 프론트엔드 형식으로 변환
        const transformedPosts = response.data.map(post => {
          // 태그 파싱
          let tagsArray = [];
          try {
            tagsArray = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [];
          } catch (e) {
            console.error('태그 파싱 실패:', e);
          }

          // 이미지 URL 생성 (postFile을 썸네일로 사용)
          const imageUrl = post.postFile 
            ? `http://localhost:8080/uploads/${post.postFile}`
            : 'https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768';

          return {
            id: post.postId,
            title: post.title,
            author: post.userNickname,
            imageUrl: imageUrl,
            likes: 0, // TODO: 좋아요 기능 추가 시 구현
            views: post.viewCnt,
            isLiked: false,
            tags: tagsArray
          };
        });

        setPosts(transformedPosts);
        setLoading(false);
      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
>>>>>>> 4116ad0c9e15aa010d7c3ded9b8e061e5f0000e9

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
<<<<<<< HEAD
    setSelectedTags((prev) => {
=======
    setSelectedTags(prev => {
>>>>>>> 4116ad0c9e15aa010d7c3ded9b8e061e5f0000e9
      const newCategoryTags = new Set(prev[category] || []);
      if (newCategoryTags.has(tag)) {
        newCategoryTags.delete(tag);
      } else {
        newCategoryTags.add(tag);
<<<<<<< HEAD
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
=======
>>>>>>> 4116ad0c9e15aa010d7c3ded9b8e061e5f0000e9
      }
      return {
        ...prev,
        [category]: Array.from(newCategoryTags),
      };
    });
  };

<<<<<<< HEAD
=======
  const handleAddPostClick = () => {
    navigate('/board/write');
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  // 선택된 태그로 필터링
  const filteredPosts = posts.filter(post => {
    const selectedTagsList = Object.values(selectedTags).flat();
    if (selectedTagsList.length === 0) return true;
    
    return selectedTagsList.some(tag => post.tags.includes(tag));
  });

  let postsToRender = [...filteredPosts];
  if (isLoggedIn) {
    postsToRender.unshift({ id: 'add-new-post', type: 'add-new' });
  }

  if (loading) {
    return (
      <div className="board-lookup-page">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <p>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

>>>>>>> 4116ad0c9e15aa010d7c3ded9b8e061e5f0000e9
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
            <div 
              key={post.id} 
              className="board-item"
              onClick={() => handlePostClick(post.id)}
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="board-item-thumbnail"
              />
              <div className="board-item-info">
                <h4 className="info-title">{post.title}</h4>
                <a 
                  href={`/profile/${post.author}`} 
                  className="info-author"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author}
                </a>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default BoardLookupPage;
