import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPage.css";

const MyPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!storedUser) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const response = await axios.get(`/api/boardlookup/user/${user.userNum}/posts`);
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("게시글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  if (loading) {
    return <div className="my-content-container"><div className="loading">로딩 중...</div></div>;
  }

  if (error) {
    return <div className="my-content-container"><div className="error">{error}</div></div>;
  }

  const getBoardTypeName = (boardType) => {
    switch(boardType) {
      case 'lookup': return '둘러보기';
      case 'free': return '커뮤니티';
      case 'job': return '채용';
      default: return boardType;
    }
  };

  const filteredPosts = activeTab === "all"
    ? posts
    : posts.filter(post => post.boardType === activeTab);

  return (
    <div className="my-content-container">
      <h2 className="my-content-title">내가 작성한 게시글</h2>

      {/* 탭 메뉴 */}
      <div className="board-type-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          전체 ({posts.length})
        </button>
        <button
          className={`tab-button ${activeTab === "lookup" ? "active" : ""}`}
          onClick={() => setActiveTab("lookup")}
        >
          둘러보기 ({posts.filter(p => p.boardType === 'lookup').length})
        </button>
        <button
          className={`tab-button ${activeTab === "free" ? "active" : ""}`}
          onClick={() => setActiveTab("free")}
        >
          커뮤니티 ({posts.filter(p => p.boardType === 'free').length})
        </button>
      </div>

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <p className="empty-message">작성한 게시글이 없습니다.</p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.postId}
              className="post-item"
              onClick={() => handlePostClick(post.postId)}
            >
              <div className="post-info-row">
                <span className="post-badge">{getBoardTypeName(post.boardType)}</span>
                <h3 className="post-title">{post.title}</h3>
              </div>
              <div className="post-bottom-row">
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <div className="post-meta">
                  <span>조회 {post.viewCnt}</span>
                  {post.price && <span className="post-price">{post.price.toLocaleString()}원</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPosts;
