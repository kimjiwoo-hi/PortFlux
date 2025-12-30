import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";
import UserDefaultIcon from "../assets/user_default_icon.png";

const UserProfile = () => {
  const { userNum, nickname } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // nickname 또는 userNum으로 조회
        const identifier = nickname || userNum;
        const endpoint = nickname ? 'nickname' : 'userNum';

        const [postsResponse, commentsResponse] = await Promise.all([
          axios.get(`/api/boardlookup/user/${endpoint}/${identifier}/posts`),
          axios.get(`/api/boardlookup/user/${endpoint}/${identifier}/comments`)
        ]);

        setPosts(postsResponse.data);
        setComments(commentsResponse.data);

        // 첫 번째 게시글이나 댓글에서 사용자 정보 추출
        if (postsResponse.data.length > 0) {
          setUserInfo({
            userNum: postsResponse.data[0].userNum,
            userNickname: postsResponse.data[0].userNickname,
            userImage: postsResponse.data[0].userImage,
          });
        } else if (commentsResponse.data.length > 0) {
          setUserInfo({
            userNum: commentsResponse.data[0].userNum,
            userNickname: commentsResponse.data[0].userNickname,
            userImage: commentsResponse.data[0].userImage,
          });
        } else {
          // 게시글이나 댓글이 없는 경우
          setUserInfo({
            userNum: userNum,
            userNickname: "사용자",
            userImage: null,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("사용자 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    if (userNum || nickname) {
      fetchUserProfile();
    }
  }, [userNum, nickname]);

  const handlePostClick = (postId) => {
    navigate(`/board/lookup/${postId}`);
  };

  const getBoardTypeName = (boardType) => {
    switch(boardType) {
      case 'lookup': return '둘러보기';
      case 'free': return '커뮤니티';
      case 'job': return '채용';
      default: return boardType;
    }
  };

  const getDefaultBanner = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Crect fill='%23e0e0e0' width='800' height='200'/%3E%3C/svg%3E";
  };

  if (loading) {
    return (
      <div className="myinfo-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myinfo-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="myinfo-container">
      <div className="myinfo-content">
        {/* 배너 이미지 */}
        <div className="banner-section">
          <img
            src={userInfo?.userBanner || getDefaultBanner()}
            alt="배너"
            className="banner-image"
          />
        </div>

        {/* 프로필 이미지 & 닉네임 */}
        <div className="profile-header">
          <div className="profile-image-wrapper">
            <img
              src={
                userInfo?.userImage
                  ? `data:image/jpeg;base64,${userInfo.userImage}`
                  : UserDefaultIcon
              }
              alt="프로필"
              className="profile-image"
            />
          </div>
          <div className="profile-info">
            <h2 className="profile-nickname">{userInfo?.userNickname}</h2>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            작성한 게시글 ({posts.length})
          </button>
          <button
            className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            작성한 댓글 ({comments.length})
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === "posts" && (
            <div className="posts-list">
              {posts.length === 0 ? (
                <p className="empty-message">작성한 게시글이 없습니다.</p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.postId}
                    className="post-item"
                    onClick={() => handlePostClick(post.postId)}
                  >
                    <div className="post-info-row">
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
          )}

          {activeTab === "comments" && (
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="empty-message">작성한 댓글이 없습니다.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.commentId}
                    className="comment-item"
                    onClick={() => handlePostClick(comment.postId)}
                  >
                    <div className="comment-post-info">
                      <span className="post-badge">{getBoardTypeName(comment.boardType)}</span>
                      <span className="comment-post-title">{comment.postTitle}</span>
                    </div>
                    <p className="comment-content">{comment.commentContent}</p>
                    <span className="comment-date">
                      {new Date(comment.commentCreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
