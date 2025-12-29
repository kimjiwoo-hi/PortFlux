import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPage.css";

const MyComments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyComments = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!storedUser) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const response = await axios.get(`/api/boardlookup/user/${user.userNum}/comments`);
        setComments(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("댓글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchMyComments();
  }, []);

  const handleCommentClick = (postId) => {
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

  return (
    <div className="my-content-container">
      <h2 className="my-content-title">내가 작성한 댓글</h2>
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="empty-message">작성한 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.commentId}
              className="comment-item"
              onClick={() => handleCommentClick(comment.postId)}
            >
              <div className="comment-post-info">
                <span className="post-badge">{getBoardTypeName(comment.boardType)}</span>
                <span className="comment-post-title">{comment.postTitle}</span>
              </div>
              <p className="comment-content">{comment.commentContent}</p>
              <span className="comment-date">
                {new Date(comment.commentCreatedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyComments;
