import "./BoardLookupPage.css";
import SearchIcon from "../assets/search.png";
import cartIcon from "../assets/cartIcon.png";
import bookmarkIcon from "../assets/Bookmark.png";
import bookmarkFilledIcon from "../assets/FilldBookmark.png";
import binheartIcon from "../assets/binheart.png";
import eyeIcon from "../assets/Eye.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tagData, tagSearchMap } from "../database/taglist";
import axios from "axios";

function BoardLookupPage() {
  const [selectedTags, setSelectedTags] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [savedPosts, setSavedPosts] = useState(new Set());
  const navigate = useNavigate();
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState("");
  const [showCartToast, setShowCartToast] = useState(false);

  // 게시글 목록 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/boardlookup/posts?timestamp=${new Date().getTime()}`,
          {
            withCredentials: true,
          }
        );

        const transformedPosts = response.data.map((post) => {
          let tagsArray = [];
          try {
            tagsArray =
              typeof post.tags === "string"
                ? JSON.parse(post.tags)
                : post.tags || [];
          } catch (e) {
            console.error("태그 파싱 실패:", e);
          }

          let imageUrl =
            "https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768";

          if (post.pdfImages && post.pdfImages.length > 0) {
            imageUrl = `http://localhost:8080${post.pdfImages[0]}`;
          } else if (post.postFile) {
            imageUrl = `http://localhost:8080/uploads/${post.postFile}`;
          }

          return {
            id: post.postId,
            title: post.title,
            author: post.userNickname,
            imageUrl: imageUrl,
            price: post.price,
            likes: post.likeCnt || 0,
            views: post.viewCnt || 0,
            isLiked: false,
            tags: tagsArray,
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

  // 저장된 게시글 확인
  useEffect(() => {
    const checkSavedPosts = async () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedUser) return;

      const loggedInUser = JSON.parse(storedUser);

      const savedPostIds = new Set();
      for (const post of posts) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/boardlookup/${post.id}/save/check`,
            {
              params: { userNum: loggedInUser.userNum },
              withCredentials: true,
            }
          );
          if (response.data.isSaved) {
            savedPostIds.add(post.id);
          }
        } catch (err) {
          console.error(`저장 상태 확인 실패 (postId: ${post.id}):`, err);
        }
      }
      setSavedPosts(savedPostIds);
    };

    if (posts.length > 0) {
      checkSavedPosts();
    }
  }, [posts]);

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

  const handleAddToCart = async (e, post) => {
    e.stopPropagation();

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const requestData = {
        productId: post.id,
      };

      await axios.post(
        `http://localhost:8080/api/cart/items`,
        requestData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);
    } catch (err) {
      console.error("장바구니 추가 실패:", err);

      if (err.response?.status === 409) {
        alert("이미 장바구니에 담긴 항목입니다.");
      } else if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert(
          `장바구니 추가에 실패했습니다: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  const handleToggleSave = async (e, post) => {
    e.stopPropagation();

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const loggedInUser = JSON.parse(storedUser);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/boardlookup/${post.id}/save`,
        null,
        {
          params: { userNum: loggedInUser.userNum },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSavedPosts((prev) => {
          const newSet = new Set(prev);
          if (response.data.isSaved) {
            newSet.add(post.id);
            setSaveToastMessage("게시글이 저장되었습니다! 🔖");
          } else {
            newSet.delete(post.id);
            setSaveToastMessage("저장이 취소되었습니다.");
          }
          return newSet;
        });

        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
      }
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장 처리에 실패했습니다.");
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  const filteredPosts = posts.filter((post) => {
    const selectedTagsList = Object.values(selectedTags).flat();
    if (selectedTagsList.length === 0) return true;

    return selectedTagsList.some((tag) => post.tags.includes(tag));
  });

  let postsToRender = [...filteredPosts];
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  if (storedUser) {
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
          <div className={`cart-toast ${showSaveToast ? "show" : ""}`}>
            {saveToastMessage}
          </div>
          <div className={`cart-toast ${showCartToast ? "show" : ""}`}>
            장바구니에 담겼습니다! 🛒
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
              onMouseEnter={() => setHoveredPostId(post.id)}
              onMouseLeave={() => setHoveredPostId(null)}
            >
              <div style={{ position: 'relative' }}>
                {hoveredPostId === post.id && (
                  <div className="hover-actions-container">
                    <span className="post-price-on-hover">
                      {post.price.toLocaleString()}₩
                    </span>
                    <button
                      className="cart-hover-button"
                      onClick={(e) => handleAddToCart(e, post)}
                    >
                      <img src={cartIcon} alt="Add to cart" />
                    </button>
                    <button
                      className="cart-hover-button bookmark-button"
                      onClick={(e) => handleToggleSave(e, post)}
                      style={{
                        backgroundColor: savedPosts.has(post.id)
                          ? "#ffffffff"
                          : "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <img
                        src={
                          savedPosts.has(post.id)
                            ? bookmarkFilledIcon
                            : bookmarkIcon
                        }
                        alt="Save"
                      />
                    </button>
                  </div>
                )}
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="board-item-thumbnail"
                  onClick={() => handlePostClick(post.id)}
                />
              </div>
              <div className="board-item-info">
                <div className="info-left">
                  <h4
                    className="info-title"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.title}
                  </h4>
                  <span
                    className="info-author"
                    onClick={() => navigate(`/mypage/${post.author}`)}
                  >
                    {post.author}
                  </span>
                </div>
                <div className="item-stats">
                  <div className="stat-item">
                    <img src={binheartIcon} alt="좋아요" style={{ width: '14px', height: '14px', opacity: 0.7 }} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="stat-item">
                    <img src={eyeIcon} alt="조회수" style={{ width: '14px', height: '14px', opacity: 0.7 }} />
                    <span>{post.views}</span>
                  </div>
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