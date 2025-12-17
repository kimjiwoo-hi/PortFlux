import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ThumbsUp, MessageSquare, Share2, CornerDownRight, MoreHorizontal } from "lucide-react";
import "./BoardFreeDetailPage.css";

const BoardFreeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 조회수 중복 증가 방지용 Ref
  const hasFetched = useRef(false);

  // --- 상태 관리 ---
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true");
  const [currentUserId] = useState(() => localStorage.getItem("userId") || sessionStorage.getItem("userId") || null);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // --- 데이터 로딩 Effect ---
  useEffect(() => {
    // 이미 데이터를 요청했다면 중단 (조회수 2배 증가 방지)
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchPostDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/board/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPostData(data);
        } else {
          setPostData(null);
        }
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
        setPostData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();

    // 댓글 및 좋아요 로컬스토리지 로드
    const allComments = JSON.parse(localStorage.getItem("boardComments")) || [];
    setComments(allComments.filter(c => String(c.post_id) === String(id)));

    if (currentUserId) {
      const userLikes = JSON.parse(localStorage.getItem(`likes_${currentUserId}`)) || [];
      setIsLiked(userLikes.includes(String(id)));
    }
  }, [id, currentUserId]);

  // ★ [수정] 날짜 포맷팅 함수 (요청하신 형식 적용) ★
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    // 예: 2025-12-17 18 : 52
    return `${year}-${month}-${day} ${hour} : ${minute}`;
  };

  // 핸들러 함수들...
  const handleEdit = () => {
    navigate('/boardfree/write', { state: { postToEdit: postData } });
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      const allPosts = JSON.parse(localStorage.getItem("boardPosts")) || [];
      const updatedPosts = allPosts.filter(p => String(p.post_id) !== String(id));
      localStorage.setItem("boardPosts", JSON.stringify(updatedPosts));
      
      const allComments = JSON.parse(localStorage.getItem("boardComments")) || [];
      const updatedComments = allComments.filter(c => String(c.post_id) !== String(id));
      localStorage.setItem("boardComments", JSON.stringify(updatedComments));

      alert("게시글이 삭제되었습니다.");
      navigate("/boardfree");
    }
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    if (!postData) return;

    let newLikeCount = parseInt(postData.like_cnt || 0, 10);
    const userLikes = JSON.parse(localStorage.getItem(`likes_${currentUserId}`)) || [];
    const strId = String(id);

    if (isLiked) {
      newLikeCount = Math.max(0, newLikeCount - 1);
      const filteredLikes = userLikes.filter(postId => postId !== strId);
      localStorage.setItem(`likes_${currentUserId}`, JSON.stringify(filteredLikes));
      setIsLiked(false);
    } else {
      newLikeCount += 1;
      userLikes.push(strId);
      localStorage.setItem(`likes_${currentUserId}`, JSON.stringify(userLikes));
      setIsLiked(true);
    }

    const updatedPost = { ...postData, like_cnt: newLikeCount };
    setPostData(updatedPost);
  };

  const submitComment = (content, parentId = null) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login", { state: { from: location.pathname } });
      return; 
    }
    
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getFullYear()).slice(2)}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const storedNickname = localStorage.getItem("userNickname");
    const writerName = storedNickname || currentUserId || "익명";
    const uniqueId = self.crypto.randomUUID();

    const newCmtObj = {
      comment_id: uniqueId,
      post_id: id,
      parent_id: parentId,
      user_nickname: writerName,
      content: content,
      created_at: formattedDate
    };

    const allComments = JSON.parse(localStorage.getItem("boardComments")) || [];
    const updatedComments = [...allComments, newCmtObj];
    localStorage.setItem("boardComments", JSON.stringify(updatedComments));

    setComments([...comments, newCmtObj]);
    setPostData(prev => ({ ...prev, comment_cnt: (prev.comment_cnt || 0) + 1 }));
    
    if (parentId) {
      setReplyTo(null);
      setReplyContent("");
    } else {
      setNewComment("");
    }
  };

  if (isLoading) return <div className="detail-loading">데이터를 불러오는 중입니다...</div>;
  if (!postData) return <div className="detail-loading">게시글을 찾을 수 없습니다.</div>;

  const isAuthor = postData && postData.userId === currentUserId;
  const rootComments = comments.filter(c => !c.parent_id);

  return (
    <div className="page-wrapper">
      <div className="detail-container">
        
        <div className="post-header">
          <div className="header-top">
            <div className="header-top-left">
              <span className="post-cat-badge">
                {postData.board_type === 'notice' ? '공지' : '자유'}
              </span>
              <h2 className="post-title">{postData.title}</h2>
            </div>
            {isAuthor && (
              <div className="post-author-menu">
                <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle-btn">
                  <MoreHorizontal size={20} />
                </button>
                {menuOpen && (
                  <div className="menu-dropdown">
                    <button onClick={handleEdit}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="post-meta-row">
            <div className="meta-left">
              {/* [수정] 닉네임과 날짜 표시 */}
              <span className="writer-name">{postData.user_nickname}</span>
              <span className="divider">|</span>
              <span className="post-date">{formatDate(postData.created_at)}</span>
            </div>
            
            <div className="meta-right">
              <span className="meta-item">추천 {postData.like_cnt || 0}</span>
              <span className="meta-spacer"></span> 
              <span className="meta-item">조회 {postData.view_cnt || 0}</span>
            </div>
          </div>
        </div>

        <div className="post-content">
          {postData.content.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* ... 버튼 및 댓글 섹션 (기존 유지) ... */}
        <div className="post-actions">
          <button className={`action-btn like-btn ${isLiked ? "active" : ""}`} onClick={handleLike}>
            <ThumbsUp size={20} />
            <span>추천 {postData.like_cnt || 0}</span>
          </button>
          <button className="action-btn share-btn">
            <Share2 size={20} />
            <span>공유</span>
          </button>
        </div>

        <div className="comment-section">
          <div className="comment-header">
            <MessageSquare size={18} />
            <span>댓글 {comments.length}</span>
          </div>

          <div className="comment-list">
            {rootComments.map((rootCmt) => {
              const replies = comments.filter(c => c.parent_id === rootCmt.comment_id);
              return (
                <div key={rootCmt.comment_id} className="comment-group">
                  <div className="comment-item root-comment">
                    <div className="cmt-top">
                      <span className="cmt-writer">{rootCmt.user_nickname}</span>
                      <span className="cmt-date">{rootCmt.created_at}</span>
                    </div>
                    <div className="cmt-content">{rootCmt.content}</div>
                    <button className="btn-reply-toggle" onClick={() => setReplyTo(replyTo === rootCmt.comment_id ? null : rootCmt.comment_id)}>답글 쓰기</button>
                  </div>
                  {replies.map(reply => (
                    <div key={reply.comment_id} className="comment-item reply-comment">
                      <div className="reply-icon"><CornerDownRight size={16} /></div>
                      <div className="reply-body">
                        <div className="cmt-top">
                          <span className="cmt-writer">{reply.user_nickname}</span>
                          <span className="cmt-date">{reply.created_at}</span>
                        </div>
                        <div className="cmt-content">{reply.content}</div>
                      </div>
                    </div>
                  ))}
                  {replyTo === rootCmt.comment_id && (
                    <div className="reply-form">
                        <div className="reply-icon-placeholder"><CornerDownRight size={16} /></div>
                        <div className="reply-input-wrapper">
                        <textarea className="reply-input" placeholder="답글을 입력하세요." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                        <button className="btn-reply-submit" onClick={() => submitComment(replyContent, rootCmt.comment_id)}>등록</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="comment-form">
            <textarea className="comment-input" placeholder={isLoggedIn ? "댓글을 입력하세요." : "로그인 후 댓글을 작성할 수 있습니다."} value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={!isLoggedIn}></textarea>
            <div className="comment-form-actions">
              <button className="cmt-submit-btn" onClick={() => submitComment(newComment)} disabled={!isLoggedIn}>등록</button>
            </div>
          </div>
        </div>

        <div className="detail-footer">
          <button className="list-btn" onClick={() => navigate("/boardfree")}>목록으로</button>
        </div>
      </div>
    </div>
  );
};

export default BoardFreeDetailPage;