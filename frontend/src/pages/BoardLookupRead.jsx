import React, { useState, /*useEffect*/ } from 'react';
import './BoardLookupRead.css';

const BoardLookupRead = () => {
  // 샘플 데이터 (실제로는 API에서 가져옴)
  const [postData, /*setPostData*/] = useState({
    post_id: 1,
    title: 'Port FLUX',
    content: 'PDF 내용이 여기에 표시됩니다.',
    price: 15000,
    post_file: 'sample.pdf',
    user_num: 1,
    user_nickname: 'soldesk',
    user_image: null,
    tags: ['#포인', '#애인'],
    view_cnt: 150,
    created_at: '2024-12-16'
  });

  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([
    { comment_id: 1, user_nickname: '댓글유저1', comment_content: '자료 정말 유익하네요!', comment_created_at: '2024-12-16' },
    { comment_id: 2, user_nickname: '댓글유저2', comment_content: '감사합니다!', comment_created_at: '2024-12-16' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 좋아요 토글
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  // 팔로우 토글
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  // 댓글창 토글
  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  // 장바구니 추가
  const handleAddToCart = () => {
    alert('장바구니에 담겼습니다.');
  };

  // 댓글 작성
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        comment_id: comments.length + 1,
        user_nickname: 'soldesk',
        comment_content: newComment,
        comment_created_at: new Date().toLocaleDateString('ko-KR')
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  // PDF 페이지 스크롤 (시뮬레이션)
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="board-lookup-read">
      <div className="main-content">
        {/* 헤더 영역 */}
        <div className="post-header">
          <div className="author-info">
            <div className="profile-wrapper">
              <div className="profile-image">
                {postData.user_image ? (
                  <img src={postData.user_image} alt="profile" />
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
              <span className="nickname">{postData.user_nickname}</span>
            </div>
          </div>

          {/* 태그 영역 */}
          <div className="tags-section">
            {postData.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* 제목 및 가격 */}
        <div className="title-section">
          <h1 className="post-title">SUBJECT</h1>
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
                Port FLUX
              </p>
              <p style={{ marginTop: '20px', color: '#ccc' }}>
                페이지 {currentPage}
              </p>
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
                  추가 내용이 여기에 표시됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 우측 사이드바 */}
      <div className="sidebar">
        {/* 프로필 아이콘 */}
        <div className="sidebar-icon profile-icon">
          <div className="icon-circle">
            👤
          </div>
        </div>

        {/* 하트 아이콘 */}
        <div 
          className={`sidebar-icon heart-icon ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeToggle}
        >
          <div className="icon-circle">
            {isLiked ? '❤️' : '🤍'}
          </div>
        </div>

        {/* 댓글 아이콘 */}
        <div 
          className="sidebar-icon comment-icon"
          onClick={handleCommentToggle}
        >
          <div className="icon-circle">
            💬
          </div>
        </div>

        {/* 장바구니 아이콘 */}
        <div 
          className="sidebar-icon cart-icon"
          onClick={handleAddToCart}
        >
          <div className="icon-circle">
            🛒
          </div>
        </div>

        {/* 요약 AI 아이콘 */}
        <div className="sidebar-icon ai-icon">
          <div className="icon-circle">
            P
          </div>
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
            {comments.map((comment) => (
              <div key={comment.comment_id} className="comment-item">
                <div className="comment-author">
                  <span className="comment-nickname">{comment.user_nickname}</span>
                  <span className="comment-date">{comment.comment_created_at}</span>
                </div>
                <p className="comment-text">{comment.comment_content}</p>
              </div>
            ))}
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