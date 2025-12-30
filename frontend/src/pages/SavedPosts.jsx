import "./MyPage.css"
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedUser) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      try {
        // 저장된 게시글 ID 목록 가져오기
        const savedPostIdsResponse = await axios.get(
          `http://localhost:8080/api/boardlookup/user/${loggedInUser.userNum}/saved`,
          { withCredentials: true }
        );

        const savedPostIds = savedPostIdsResponse.data;

        // 각 게시글 상세 정보 가져오기
        const postsPromises = savedPostIds.map(postId =>
          axios.get(`http://localhost:8080/api/boardlookup/${postId}`, {
            withCredentials: true
          })
        );

        const postsResponses = await Promise.all(postsPromises);
        const posts = postsResponses.map(res => res.data.post || res.data);

        setSavedPosts(posts);
        setLoading(false);
      } catch (err) {
        console.error("저장된 게시글 로드 실패:", err);
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [navigate]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="saved-posts-container">
      <h2>저장한 게시글</h2>
      {savedPosts.length === 0 ? (
        <p>저장한 게시글이 없습니다.</p>
      ) : (
        <div className="posts-grid">
          {savedPosts.map(post => (
            <div
              key={post.postId}
              className="post-card"
              onClick={() => navigate(`/board/lookup/${post.postId}`)}
            >
              <h3>{post.title}</h3>
              <p>{post.userNickname}</p>
              <p>{post.price.toLocaleString()}₩</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedPosts;
