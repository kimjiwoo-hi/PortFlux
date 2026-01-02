import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPage.css";
import binheartIcon from "../assets/binheart.png";
import eyeIcon from "../assets/Eye.png";
import bookmarkFilledIcon from "../assets/FilldBookmark.png";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        
        if (!storedUser) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const loggedInUser = JSON.parse(storedUser);
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        // 1. 저장된 게시글 ID 목록 가져오기
        const savedIdsResponse = await axios.get(
          `http://localhost:8080/api/boardlookup/user/${loggedInUser.userNum}/saved`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );

        if (!savedIdsResponse.data || savedIdsResponse.data.length === 0) {
          setSavedPosts([]);
          setLoading(false);
          return;
        }

        // 2. 각 게시글의 상세 정보 가져오기
        const postDetailsPromises = savedIdsResponse.data.map((postId) =>
          axios.get(`http://localhost:8080/api/boardlookup/${postId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          })
        );

        const postDetailsResponses = await Promise.all(postDetailsPromises);
        const posts = postDetailsResponses.map((res) => res.data.post || res.data);

        // 3. 데이터 변환
        const transformedPosts = posts.map((post) => {
          let tagsArray = [];
          try {
            tagsArray = typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags || [];
          } catch (e) {
            console.error("태그 파싱 실패:", e);
          }

          let imageUrl = "https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768";
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
            price: post.price || 0,
            likes: post.likeCnt || 0,
            views: post.viewCnt || 0,
            tags: tagsArray,
            createdAt: post.createdAt,
          };
        });

        setSavedPosts(transformedPosts);
        setLoading(false);

      } catch (err) {
        console.error("저장된 게시글 조회 실패:", err);
        setError("저장한 게시글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [navigate]);

  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  const handleUnsave = async (e, postId) => {
    e.stopPropagation();
    
    if (!window.confirm("저장을 취소하시겠습니까?")) return;

    try {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!storedUser) {
        alert("로그인이 필요합니다.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      const response = await axios.post(
        `http://localhost:8080/api/boardlookup/${postId}/save`,
        null,
        {
          params: { userNum: loggedInUser.userNum },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
      }
    } catch (err) {
      console.error("저장 취소 실패:", err);
      alert("저장 취소에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="mypage-section">
        <div className="loading-message">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage-section">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-browse">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>저장한 게시글</h2>
        <p className="section-count">총 {savedPosts.length}개</p>
      </div>

      {savedPosts.length === 0 ? (
        <div className="empty-state">
          <p>저장한 게시글이 없습니다.</p>
          <button onClick={() => navigate("/")} className="btn-browse">
            게시글 둘러보기
          </button>
        </div>
      ) : (
        <div className="posts-list">
          {savedPosts.map((post) => (
            <div
              key={post.id}
              className="post-item"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="post-thumbnail-container">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="post-thumbnail"
                />
              </div>
              
              <div className="post-content">
                <div className="post-info-row">
                  <h3 className="post-title">{post.title}</h3>
                  <button
                    className="unsave-button"
                    onClick={(e) => handleUnsave(e, post.id)}
                    title="저장 취소"
                  >
                    <img src={bookmarkFilledIcon} alt="저장 취소" />
                  </button>
                </div>
                
                <div className="post-author">{post.author}</div>

                <div className="post-bottom-row">
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <div className="post-meta">
                    <div className="post-stats">
                      <div className="stat-item">
                        <img src={binheartIcon} alt="좋아요" style={{ width: "14px", height: "14px", opacity: 0.7 }} />
                        <span>{post.likes}</span>
                      </div>
                      <div className="stat-item">
                        <img src={eyeIcon} alt="조회수" style={{ width: "14px", height: "14px", opacity: 0.7 }} />
                        <span>{post.views}</span>
                      </div>
                    </div>
                    <span className="post-price">{post.price.toLocaleString()}원</span>
                  </div>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="tag-more">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;