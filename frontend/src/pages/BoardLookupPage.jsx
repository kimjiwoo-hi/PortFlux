import "./BoardLookupPage.css";
import SearchIcon from "../assets/search.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tagData, tagSearchMap } from "../database/taglist";
import axios from "axios";
import { addToCart } from "../api/api";

function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // 로그인 상태 및 사용자 정보 확인
  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user.user);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, []);

  const handleAddToCart = async (post) => {
    if (!isLoggedIn || !currentUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // --- [디버깅 추가] ---
    console.log("--- 장바구니 추가 디버깅 ---");
    console.log("사용자 ID (currentUser.userId):", currentUser.userId);
    console.log("포스트 객체 (post):", post);
    // --------------------

    try {
      const item = {
        productId: post.id,
        productName: post.title,
        unitPrice: parseFloat(post.price),
        qty: 1,
      };

      await addToCart(currentUser.userNum, item);
      alert("포트폴리오가 장바구니에 추가되었습니다.");
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        "장바구니 추가에 실패했습니다. 이미 담겨있을 수 있습니다.";
      alert(errorMessage);
    }
  };

  // 게시글 목록 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/boardlookup/posts",
          {
            withCredentials: true,
          }
        );

        // API 응답 데이터를 프론트엔드 형식으로 변환
        const transformedPosts = response.data.map((post) => {
          // 태그 파싱
          let tagsArray = [];
          try {
            tagsArray =
              typeof post.tags === "string"
                ? JSON.parse(post.tags)
                : post.tags || [];
          } catch (e) {
            console.error("태그 파싱 실패:", e);
          }

          // 이미지 URL 생성 (postFile을 썸네일로 사용)
          const imageUrl = post.postFile
            ? `http://localhost:8080/uploads/${post.postFile}`
            : "https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768";

          return {
            id: post.postId,
            title: post.title,
            author: post.userNickname,
            imageUrl: imageUrl,
            likes: 0, // TODO: 좋아요 기능 추가 시 구현
            views: post.viewCnt,
            isLiked: false,
            tags: tagsArray,
            price: post.price, // 가격 정보 추가
          };
        });

        setPosts(transformedPosts);
        setLoading(false);
      } catch (err) {
        console.error("게시글 로드 실패:", err);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  const handleAddPostClick = () => {
    navigate("/board/write");
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  // 선택된 태그로 필터링
  const filteredPosts = posts.filter((post) => {
    const selectedTagsList = Object.values(selectedTags).flat();
    if (selectedTagsList.length === 0) return true;

    return selectedTagsList.some((tag) => post.tags.includes(tag));
  });

  let postsToRender = [...filteredPosts];
  if (isLoggedIn) {
    postsToRender.unshift({ id: "add-new-post", type: "add-new" });
  }

  if (loading) {
    return (
      <div className="board-lookup-page">
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <p>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <a
                    href={`/profile/${post.author}`}
                    className="info-author"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.author}
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(post);
                    }}
                    style={{
                      padding: "5px 10px",
                      cursor: "pointer",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    장바구니
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default BoardLookupPage;
