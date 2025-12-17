import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './BoardLookupRead.css';

const BoardLookupRead = () => {
  const { postId } = useParams(); // URL에서 postId 추출
  const [postData, setPostData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 게시글 데이터 로드
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/boardlookup/${postId}`, {
          withCredentials: true
        });
        
        // response.data가 직접 post와 comments를 포함하고 있는지 확인
        if (response.data) {
          setPostData(response.data.post || response.data);
          setComments(response.data.comments || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setError('게시글을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  // 좋아요 토글
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    // TODO: 좋아요 API 연동
  };

  // 팔로우 토글
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: 팔로우 API 연동
  };

  // 댓글창 토글
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  // 장바구니 추가
  const handleAddToCart = () => {
    alert('장바구니에 담겼습니다.');
    // TODO: 장바구니 API 연동
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        await axios.post(
          `http://localhost:8080/api/boardlookup/${postId}/comments`,
          {
            userNum: 1, // TODO: 실제 로그인한 사용자 번호로 변경
            content: newComment
          },
          { withCredentials: true }
        );

        // 댓글 목록 새로고침
        const updatedResponse = await axios.get(`http://localhost:8080/api/boardlookup/${postId}`);
        if (updatedResponse.data) {
          setComments(updatedResponse.data.comments || []);
        }
        setNewComment('');
      } catch (err) {
        console.error('댓글 작성 실패:', err);
        alert('댓글 작성에 실패했습니다.');
      }
    }
  };

  // PDF 페이지 스크롤
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="board-lookup-read" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#fff', fontSize: '18px' }}>로딩 중...</p>
      </div>
    );
  }

  // 에러 발생
  if (error || !postData) {
    return (
      <div className="board-lookup-read" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#fff', fontSize: '18px' }}>{error || '게시글을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  // 태그 배열 처리 (JSON 문자열일 경우 파싱)
  let tagsArray = [];
  try {
    tagsArray = typeof postData.tags === 'string' ? JSON.parse(postData.tags) : postData.tags || [];
  } catch (e) {
    console.error('태그 파싱 실패:', e);
  }

  // 사용자 이미지 처리 (BLOB 데이터)
  const userImageSrc = postData.userImage 
    ? `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(postData.userImage)))}`
    : null;

  return (
    <div className="board-lookup-read">
      <div className="main-content">
        {/* 헤더 영역 */}
        <div className="post-header">
          <div className="author-info">
            <div className="profile-wrapper">
              <div className="profile-image">
                {userImageSrc ? (
                  <img src={userImageSrc} alt="profile" />
                ) : (
                  <div className="default-profile">👤</div>
                )}
                <button 
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? '✓' : '+'}
                </button>
              </div>
              <span className="nickname">{postData.userNickname}</span>
            </div>
          </div>

          {/* 태그 영역 */}
          <div className="tags-section">
            {tagsArray.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* 제목 및 가격 */}
        <div className="title-section">
          <h1 className="post-title">{postData.title}</h1>
          <div className="price-section">
            <span className="price-label">가격</span>
            <span className="price-value">{postData.price.toLocaleString()}₩</span>
          </div>
        </div>

        {/* PDF/PPT 뷰어 영역 */}
        <div className="pdf-viewer" onScroll={handleScroll}>
          <div className="pdf-page">
            <div className="pdf-content">
              <p style={{ fontSize: '48px', fontWeight: '300', color: '#fff' }}>
                {postData.title}
              </p>
              <p style={{ marginTop: '20px', color: '#ccc' }}>
                조회수: {postData.viewCnt} | 다운로드: {postData.downloadCnt}
              </p>
              {postData.aiSummary && (
                <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                  <h3 style={{ color: '#1e90ff', marginBottom: '10px' }}>AI 요약</h3>
                  <p style={{ color: '#ccc', lineHeight: '1.6' }}>{postData.aiSummary}</p>
                </div>
              )}
              <p style={{ marginTop: '40px', color: '#999', fontSize: '14px' }}>
                ⬇ 스크롤하여 다음 페이지 보기
              </p>
            </div>
          </div>
          {currentPage > 1 && (
            <div className="pdf-page">
              <div className="pdf-content">
                <p style={{ fontSize: '36px', color: '#fff' }}>
                  페이지 {currentPage}
                </p>
                <p style={{ marginTop: '20px', color: '#ccc' }}>
                  {postData.content}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 우측 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-icon profile-icon">
          <div className="icon-circle">👤</div>
        </div>

        <div 
          className={`sidebar-icon heart-icon ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeToggle}
        >
          <div className="icon-circle">{isLiked ? '❤️' : '🤍'}</div>
        </div>

        <div 
          className="sidebar-icon comment-icon"
          onClick={handleCommentToggle}
        >
          <div className="icon-circle">💬</div>
        </div>

        <div 
          className="sidebar-icon cart-icon"
          onClick={handleAddToCart}
        >
          <div className="icon-circle">🛒</div>
        </div>

        <div className="sidebar-icon ai-icon">
          <div className="icon-circle">P</div>
          <span className="ai-label">요약 AI</span>
        </div>
      </div>

      {/* 댓글 팝업 */}
      {showComments && (
        <div className="comments-popup">
          <div className="comments-header">
            <h3>댓글</h3>
            <button className="close-btn" onClick={handleCommentToggle}>✕</button>
          </div>
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.commentId} className="comment-item">
                  <div className="comment-author">
                    <span className="comment-nickname">{comment.userNickname}</span>
                    <span className="comment-date">
                      {new Date(comment.commentCreatedAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="comment-text">{comment.commentContent}</p>
                </div>
              ))
            )}
          </div>

          <div className="comment-input-section">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows="3"
            />
            <button className="submit-btn" onClick={handleCommentSubmit}>
              작성
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardLookupRead;