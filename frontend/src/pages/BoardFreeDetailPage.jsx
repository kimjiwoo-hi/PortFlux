import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, MessageSquare, Share2, CornerDownRight, MoreHorizontal, Download, X, Copy } from "lucide-react";
import "./BoardFreeDetailPage.css";

const BoardFreeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [isLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true");
  const [currentUserNum] = useState(() => localStorage.getItem("userNum") || sessionStorage.getItem("userNum"));
  // 권한 구분을 위한 role 상태
  const [userRole] = useState(() => localStorage.getItem("role") || sessionStorage.getItem("role") || "USER");
  
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  const [replyTo, setReplyTo] = useState(null); 
  const [replyContent, setReplyContent] = useState(""); 
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [editingCommentId, setEditingCommentId] = useState(null); 
  const [editContent, setEditContent] = useState(""); 
  const [activeCommentMenu, setActiveCommentMenu] = useState(null); 
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 1. 권한 체크 로직 (오류 3 해결 반영)
  const isMyPost = () => {
    if (!postData || !currentUserNum) return false;
    
    const loginId = String(currentUserNum);
    const role = userRole;

    if (role === "ADMIN") return true;

    if (role === "COMPANY") {
      // 기업 회원이면 postData의 companyNum과 비교
      return String(postData.companyNum) === loginId;
    } else {
      // 일반 회원이면 postData의 userNum과 비교
      return String(postData.userNum) === loginId;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpen(false);
        }
        if (activeCommentMenu && !event.target.closest('.comment-menu-container')) {
            setActiveCommentMenu(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuOpen, activeCommentMenu]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/board/free/comments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) { console.error("댓글 로딩 실패:", error); }
  }, [id]);

  const fetchPostDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const postRes = await fetch(`http://localhost:8080/api/board/free/detail/${id}`);
      if (postRes.ok) {
        const postJson = await postRes.json();
        setPostData(postJson);
        
        // 추천 상태 초기화 (권한별 구분된 키 사용)
        if (currentUserNum) {
          const storageKey = `likes_${userRole}_${currentUserNum}`;
          const userLikes = JSON.parse(localStorage.getItem(storageKey)) || [];
          setIsLiked(userLikes.includes(String(id)));
        }
      }
      await fetchComments();
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUserNum, userRole, fetchComments]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPostDetail();
  }, [fetchPostDetail]);

  const handleUserClick = (userNum, companyNum) => {
    const targetNum = userNum || companyNum;
    if (!targetNum) return;
    navigate("/mypage", { state: { userNum: targetNum } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    let date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const kstDate = new Date(date.getTime() + KST_OFFSET);
    const pad = (n) => String(n).padStart(2, '0');
    return `${kstDate.getFullYear()}-${pad(kstDate.getMonth() + 1)}-${pad(kstDate.getDate())} ${pad(kstDate.getHours())}:${pad(kstDate.getMinutes())}:${pad(kstDate.getSeconds())}`;
  };

  const handleDownload = (filename) => {
    if (!filename) return;
    window.location.href = `http://localhost:8080/api/board/free/download/${filename}`;
  };

  const getDisplayName = (filename) => {
    if (!filename) return "";
    const underscoreIndex = filename.indexOf('_');
    return underscoreIndex !== -1 ? filename.substring(underscoreIndex + 1) : filename;
  };

  const handleEdit = () => {
    navigate('/boardfree/write', { state: { postToEdit: postData } });
  };

  const handleDelete = async () => {
    if (window.confirm("삭제하시겠습니까?")) {
        try {
            const res = await fetch(`http://localhost:8080/api/board/free/delete/${id}`, { method: "DELETE" });
            if(res.ok) { 
                alert("삭제되었습니다."); 
                navigate("/boardfree"); 
            }
        } catch (error) { console.error(error); }
    }
  };

  // 2. 추천 로직 (요청하신 수정 사항 반영)
  const handleLike = async () => {
    if (!isLoggedIn) { alert("로그인이 필요한 서비스입니다."); return; }
    
    try {
      const response = await fetch(`http://localhost:8080/api/board/free/like/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUserNum, 
          role: userRole // 반드시 role을 같이 보내야 서버에서 구분함
        }),
      });

      if (response.ok) {
        const result = await response.text();
        const isNowLiked = (result === "LIKED");
        setIsLiked(isNowLiked);
        
        // 화면의 추천수 즉시 반영
        setPostData(prev => ({
          ...prev,
          likeCnt: isNowLiked ? (prev.likeCnt + 1) : Math.max(0, prev.likeCnt - 1)
        }));
        
        // 로컬 스토리지에 유저별/게시글별 상태 저장
        const storageKey = `likes_${userRole}_${currentUserNum}`;
        const userLikes = JSON.parse(localStorage.getItem(storageKey)) || [];
        if (isNowLiked) {
          localStorage.setItem(storageKey, JSON.stringify([...userLikes, String(id)]));
        } else {
          localStorage.setItem(storageKey, JSON.stringify(userLikes.filter(pid => pid !== String(id))));
        }
      }
    } catch (error) { console.error("추천 오류:", error); }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("링크가 클립보드에 복사되었습니다.");
    setIsShareModalOpen(false);
  };

  // 댓글 작성 시 role 정보 포함
  const submitComment = async (content, parentId = null) => {
    if (!isLoggedIn) { alert("로그인 필요"); navigate("/login"); return; }
    if (!content.trim()) return;
    try {
        const response = await fetch(`http://localhost:8080/api/board/free/comment/write`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                postId: id,
                userNum: parseInt(currentUserNum),
                content: content,
                parentId: parentId,
                role: userRole
            })
        });
        if (response.ok) {
            await fetchComments();
            setNewComment("");
            setReplyTo(null);
            setReplyContent("");
            setPostData(prev => ({ ...prev, commentCnt: (prev.commentCnt || 0) + 1 }));
        }
    } catch (error) { console.error(error); }
  };

  const handleDeleteComment = async (commentId) => {
    const hasReplies = comments.some(c => c.parentId === commentId);
    if (hasReplies) { alert("답글이 달린 댓글은 삭제할 수 없습니다."); return; }
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
        const res = await fetch(`http://localhost:8080/api/board/free/comment/delete/${commentId}`, { method: "DELETE" });
        if (res.ok) {
            setComments(comments.filter(c => c.commentId !== commentId));
            setPostData(prev => ({ ...prev, commentCnt: Math.max(0, prev.commentCnt - 1) }));
        }
    } catch (error) { console.error("댓글 삭제 실패", error); }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;
    try {
        const res = await fetch(`http://localhost:8080/api/board/free/comment/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentId, content: editContent })
        });
        if (res.ok) {
            await fetchComments();
            setEditingCommentId(null);
            setEditContent("");
        }
    } catch (error) { console.error("댓글 수정 실패", error); }
  };

  if (isLoading) return <div className="detail-loading">데이터 로딩 중...</div>;
  if (!postData) return <div className="detail-loading">글을 찾을 수 없습니다.</div>;

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div className="page-wrapper">
      <div className="detail-container">
        <div className="post-header">
          <div className="header-top">
            <div className="header-top-left">
              <span className="post-cat-badge">{postData.boardType === 'notice' ? '공지' : '자유'}</span>
              <h2 className="post-title">{postData.title}</h2>
            </div>
            {isMyPost() && (
              <div className="post-author-menu" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle-btn"><MoreHorizontal size={20} /></button>
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
              <span className="writer-name" onClick={() => handleUserClick(postData.userNum, postData.companyNum)}>
                {postData.writerNickname || "알 수 없음"}
              </span>
              <span className="divider-bar">|</span>
              <span className="post-date">{formatDate(postData.createdAt)}</span>
            </div>
            <div className="meta-right">
              <span className="meta-item">추천 {postData.likeCnt || 0}</span>
              <span className="divider-bar">|</span>
              <span className="meta-item">조회 {postData.viewCnt || 0}</span>
            </div>
          </div>
        </div>

        <div className="post-content">
          {postData.image && (
             <div className="post-image-area" style={{marginBottom: '20px'}}>
                 <img src={`http://localhost:8080/api/board/free/image/${postData.image}`} alt="Post" style={{maxWidth:'100%'}} />
             </div>
          )}
          {postData.content.split("\n").map((line, i) => (<p key={i}>{line}</p>))}
        </div>

        {postData.postFile && (
            <div className="post-attachment">
                <Download size={20} color="#555"/>
                <span style={{flex:1, color:'#333'}}>{getDisplayName(postData.postFile)}</span>
                <button onClick={() => handleDownload(postData.postFile)} className="download-btn">다운로드</button>
            </div>
        )}

        <div className="post-actions">
          <button className={`action-btn like-btn ${isLiked ? "active" : ""}`} onClick={handleLike}>
            <ThumbsUp size={20} /><span>추천 {postData.likeCnt || 0}</span>
          </button>
          <button className="action-btn share-btn" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={20} /><span>공유</span>
          </button>
        </div>

        <div className="comment-section">
          <div className="comment-header">
            <MessageSquare size={18} />
            <span>댓글 <span className="comment-count-red">{comments.length > 999 ? '999+' : comments.length}</span></span>
          </div>
          
          <div className="comment-list">
            {rootComments.map((rootCmt) => {
              const replies = comments.filter(c => c.parentId === rootCmt.commentId);
              return (
                <div key={rootCmt.commentId} className="comment-group">
                  <div className="comment-item root-comment">
                    <div className="cmt-top">
                      <div className="cmt-writer-row">
                        <span className="cmt-writer" onClick={() => handleUserClick(rootCmt.userNum, rootCmt.companyNum)}>
                          {rootCmt.userNickname}
                        </span>
                        {rootCmt.modifyAt && <span className="cmt-edited-tag">(수정)</span>}
                      </div>
                      <div className="cmt-top-right">
                        <span className="cmt-date">{formatDate(rootCmt.createdAt)}</span>
                        {(String(rootCmt.userNum) === String(currentUserNum) || String(rootCmt.companyNum) === String(currentUserNum)) && (
                          <div className="comment-menu-container">
                            <button className="menu-toggle-btn" onClick={() => setActiveCommentMenu(activeCommentMenu === rootCmt.commentId ? null : rootCmt.commentId)}>
                              <MoreHorizontal size={16} />
                            </button>
                            {activeCommentMenu === rootCmt.commentId && (
                              <div className="menu-dropdown comment-dropdown">
                                <button onClick={() => { setEditingCommentId(rootCmt.commentId); setEditContent(rootCmt.content); setActiveCommentMenu(null); }}>수정</button>
                                <button onClick={() => { handleDeleteComment(rootCmt.commentId); setActiveCommentMenu(null); }}>삭제</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {editingCommentId === rootCmt.commentId ? (
                      <div className="edit-form-container">
                        <textarea className="edit-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <div className="edit-buttons">
                          <button className="btn-save" onClick={() => handleUpdateComment(rootCmt.commentId)}>저장</button>
                          <button className="btn-cancel" onClick={() => setEditingCommentId(null)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <div className="cmt-content">{rootCmt.content}</div>
                    )}
                    <button className="btn-reply-toggle" onClick={() => setReplyTo(replyTo === rootCmt.commentId ? null : rootCmt.commentId)}>답글 쓰기</button>
                  </div>

                  {replies.map(reply => (
                    <div key={reply.commentId} className="comment-item reply-comment">
                      <div className="reply-icon"><CornerDownRight size={16} /></div>
                      <div className="reply-body">
                        <div className="cmt-top">
                          <div className="cmt-writer-row">
                            <span className="cmt-writer" onClick={() => handleUserClick(reply.userNum, reply.companyNum)}>{reply.userNickname}</span>
                            {reply.modifyAt && <span className="cmt-edited-tag">(수정)</span>}
                          </div>
                          <div className="cmt-top-right">
                            <span className="cmt-date">{formatDate(reply.createdAt)}</span>
                            {(String(reply.userNum) === String(currentUserNum) || String(reply.companyNum) === String(currentUserNum)) && (
                              <div className="comment-menu-container">
                                <button className="menu-toggle-btn" onClick={() => setActiveCommentMenu(activeCommentMenu === reply.commentId ? null : reply.commentId)}>
                                  <MoreHorizontal size={16} />
                                </button>
                                {activeCommentMenu === reply.commentId && (
                                  <div className="menu-dropdown comment-dropdown">
                                    <button onClick={() => { setEditingCommentId(reply.commentId); setEditContent(reply.content); setActiveCommentMenu(null); }}>수정</button>
                                    <button onClick={() => { handleDeleteComment(reply.commentId); setActiveCommentMenu(null); }}>삭제</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {editingCommentId === reply.commentId ? (
                          <div className="edit-form-container">
                            <textarea className="edit-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                            <div className="edit-buttons">
                              <button className="btn-save" onClick={() => handleUpdateComment(reply.commentId)}>저장</button>
                              <button className="btn-cancel" onClick={() => setEditingCommentId(null)}>취소</button>
                            </div>
                          </div>
                        ) : (
                          <div className="cmt-content">{reply.content}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {replyTo === rootCmt.commentId && (
                    <div className="reply-form">
                        <div className="reply-icon-placeholder"><CornerDownRight size={16} /></div>
                        <div className="reply-input-wrapper">
                          <textarea className="reply-input" placeholder="답글을 입력하세요." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
                          <button className="btn-reply-submit" onClick={() => submitComment(replyContent, rootCmt.commentId)}>등록</button>
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
            {comments.length === 0 && <div className="no-comments">첫 번째 댓글을 남겨보세요!</div>}
          </div>
          
          <div className="comment-form">
            <textarea className="comment-input" placeholder={isLoggedIn ? "댓글을 입력하세요." : "로그인 후 댓글 작성 가능"} value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={!isLoggedIn}></textarea>
            <div className="comment-form-actions">
              <button className="cmt-submit-btn" onClick={() => submitComment(newComment)} disabled={!isLoggedIn}>등록</button>
            </div>
          </div>
        </div>

        <div className="detail-footer">
          <button className="list-btn" onClick={() => navigate("/boardfree")}>목록으로</button>
        </div>
      </div>

      {isShareModalOpen && (
        <div className="modal-overlay" onClick={() => setIsShareModalOpen(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>페이지 공유하기</h3>
              <button className="modal-close-btn" onClick={() => setIsShareModalOpen(false)}>
                <X size={24} color="#333" strokeWidth={2.5} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">아래 주소를 복사하여 공유하세요.</p>
              <div className="url-copy-box">
                <input type="text" value={window.location.href} readOnly />
                <button onClick={handleCopyUrl}><Copy size={16} /> 복사</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardFreeDetailPage;