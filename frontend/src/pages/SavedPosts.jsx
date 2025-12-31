import "./MyPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedUser) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      try {
        setLoading(true);
        // 저장된 게시글 상세 정보를 한 번에 가져오기
        const response = await axios.get(
          `http://localhost:8080/api/boardlookup/user/${loggedInUser.userNum}/saved/posts`,
          { withCredentials: true }
        );

        setSavedPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("저장된 게시글 로드 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [navigate]);

  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  if (loading) {
    return (
      <div className="my-content-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-content-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-content-container">
      <h2 className="my-content-title">저장한 게시글</h2>

      <div className="posts-list">
        {savedPosts.length === 0 ? (
          <p className="empty-message">저장한 게시글이 없습니다.</p>
        ) : (
          savedPosts.map((post) => (
            <div
              key={post.postId}
              className="post-item saved-post-item"
              onClick={() => handlePostClick(post.postId)}
            >
              {/* 썸네일 이미지 */}
              {post.pdfImages && post.pdfImages.length > 0 && (
                <div className="post-thumbnail">
                  <img
                    src={`http://localhost:8080${post.pdfImages[0]}`}
                    alt={post.title}
                    onError={(e) => {
                      e.target.src =
                        "https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768";
                    }}
                  />
                </div>
              )}

              {/* 게시글 정보 */}
              <div className="post-content">
                <div className="post-info-row">
                  <span className="post-badge">둘러보기</span>
                  <h3 className="post-title">{post.title}</h3>
                </div>

                <div className="post-author-info">
                  <span className="post-author">{post.userNickname}</span>
                </div>

                <div className="post-bottom-row">
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  <div className="post-meta">
                    <span>조회 {post.viewCnt}</span>
                    {post.price && (
                      <span className="post-price">
                        {post.price.toLocaleString()}원
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SavedPosts;
