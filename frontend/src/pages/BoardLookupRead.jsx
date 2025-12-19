import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X } from "lucide-react"; 
import heartIcon from '../assets/heart.png';
import binheartIcon from '../assets/binheart.png';
import commentIcon from '../assets/comment.png';
import cartIcon from '../assets/cartIcon.png';
import summaryAIIcon from '../assets/summary_AI.svg';
import "./BoardLookupRead.css";

const BoardLookupRead = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [postData, setPostData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // 게시글 데이터 로드
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/boardlookup/${postId}`,
          { withCredentials: true }
        );

        if (response.data) {
          setPostData(response.data.post || response.data);
          setComments(response.data.comments || []);
          setLikeCount(response.data.post?.likeCnt || 0);
          setIsLiked(false); // 초기값
        }
        setLoading(false);
      } catch (err) {
        console.error("게시글 로드 실패:", err);
        setError("게시글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    if (postId) fetchPostData();
  }, [postId]);

  // 스크롤 이벤트 - 헤더/사이드바 표시
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHeaderVisible(false);
        setSidebarVisible(false);
      } else {
        setHeaderVisible(true);
        setSidebarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/boardlookup/like",
        null,
        { params: { postId }, withCredentials: true }
      );
      setLikeCount(response.data.likeCnt);
      setIsLiked(true);
    } catch (err) {
      console.error("좋아요 에러:", err);
      alert("좋아요 처리 실패");
    }
  };

  // 팔로우 토글
  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  // 댓글창 토글
  const handleCommentToggle = () => {
    setShowComments(!showComments);
    setShowAISummary(false);
  };

  // AI 요약 토글
  const handleAISummaryToggle = () => {
    setShowAISummary(!showAISummary);
    setShowComments(false);
  };

  // 장바구니 추가
  const handleAddToCart = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/cart",
        { postId },
        { withCredentials: true }
      );
      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);
    } catch (err) {
      if (err.response?.status === 409) alert("이미 장바구니에 담긴 항목입니다.");
      else alert("장바구니 추가에 실패했습니다.");
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `http://localhost:8080/api/boardlookup/${postId}/comments`,
        { userNum: 1, content: newComment },
        { withCredentials: true }
      );
      const updatedResponse = await axios.get(
        `http://localhost:8080/api/boardlookup/${postId}`
      );
      setComments(updatedResponse.data.comments || []);
      setNewComment("");
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // PDF 페이지 스크롤
  const handlePdfScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) setCurrentPage((p) => p + 1);
  };

  // 오버레이 및 배경 클릭
  const handleOverlayClick = () => {
    setShowComments(false);
    setShowAISummary(false);
  };
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) navigate("/");
  };
  const handleCloseClick = () => navigate("/");

  if (loading)
    return (
      <div className="board-lookup-read" style={{ display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh" }}>
        <p style={{ color:"#191919", fontSize:"18px" }}>로딩 중...</p>
      </div>
    );

  if (error || !postData)
    return (
      <div className="board-lookup-read" style={{ display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh" }}>
        <p style={{ color:"#191919", fontSize:"18px" }}>{error || "게시글을 찾을 수 없습니다."}</p>
      </div>
    );

  // 태그 배열 처리
  let tagsArray = [];
  try { tagsArray = typeof postData.tags === "string" ? JSON.parse(postData.tags) : postData.tags || []; } 
  catch (e) { console.error("태그 파싱 실패:", e); }

  const userImageSrc = postData.userImage
    ? `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(postData.userImage)))}`
    : null;

  return (
    <div className="board-lookup-read" onClick={handleBackgroundClick}>
      {/* 오버레이 */}
      <div className={`overlay-background ${showComments || showAISummary ? "active" : ""}`} onClick={handleOverlayClick} />

      {/* 헤더 */}
      <div className={`post-header ${!headerVisible ? "hidden" : ""}`}>
        <div className="author-info">
          <div className="profile-wrapper">
            <div className="profile-left">
              <div className="profile-top">
                <div className="profile-image">
                  {userImageSrc ? <img src={userImageSrc} alt="profile" /> : <div className="default-profile">👤</div>}
                  <button className={`follow-btn ${isFollowing ? "following" : ""}`} onClick={handleFollowToggle}>
                    {isFollowing ? "✓" : "+"}
                  </button>
                </div>
                <div className="profile-info">
                  <div className="nickname">{postData.userNickname}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right"><h1 className="post-title">{postData.title}</h1></div>
        </div>
        <div className="tags-section">{tagsArray.map((tag,i)=><span key={i} className="tag">{tag}</span>)}</div>
        <button className="close-post-button" onClick={handleCloseClick}><X size={24} /></button>
      </div>

      {/* PDF / 콘텐츠 */}
      <div className="main-content">
        <div className="pdf-viewer" onScroll={handlePdfScroll}>
          <div className="pdf-page">
            <div className="pdf-content">
              {postData.postFile ? (() => {
                const isPdf = /\.pdf$/i.test(postData.postFile);
                const isPpt = /\.(ppt|pptx)$/i.test(postData.postFile);
                const fileUrl = `http://localhost:8080/uploads/${postData.postFile}`;
                if (isPdf && Array.isArray(postData.pdfImages)) {
                  return <div className="pdf-image-wrapper">{postData.pdfImages.map((imgUrl,index)=><img key={index} src={`http://localhost:8080${imgUrl}`} alt={`pdf-${index}`} className="pdf-page-image" loading="lazy"/>)}</div>;
                } else if (isPpt) {
                  return <div style={{textAlign:"center",padding:"50px"}}><h3 style={{color:"#191919",marginBottom:"20px"}}>미리보기를 지원하지 않습니다.</h3><a href={fileUrl} download className="download-button">{postData.postFile} 다운로드</a></div>;
                } else {
                  return <div style={{textAlign:"center",padding:"50px"}}><h3 style={{color:"#191919"}}>지원하지 않는 파일 형식입니다.</h3></div>;
                }
              })() : <><p style={{fontSize:"48px",fontWeight:"300",color:"#191919",marginBottom:"20px"}}>{postData.title}</p><p style={{color:"#666",fontSize:"15px"}}>조회수: {postData.viewCnt} | 다운로드: {postData.downloadCnt}</p></>}
            </div>
          </div>

          {currentPage>1 && <div className="pdf-page"><div className="pdf-content"><p style={{fontSize:"36px",color:"#191919",marginBottom:"20px"}}>페이지 {currentPage}</p><p style={{color:"#333",fontSize:"15px",lineHeight:"1.8"}}>{postData.content}</p></div></div>}
        </div>
      </div>

      {/* 사이드바 */}
      <div className={`sidebar ${!sidebarVisible ? "hidden" : ""}`}>
        <div className="sidebar-icon profile-icon">{userImageSrc ? <img src={userImageSrc} alt="프로필" className="profile-mini-image"/> : <div className="default-profile-mini">👤</div>}</div>
        <div className={`sidebar-icon heart-icon ${isLiked ? "liked" : ""}`} onClick={handleLikeToggle}>
          <img src={isLiked ? heartIcon : binheartIcon} alt="좋아요" className="icon-image" />
          <span className="like-count">{likeCount}</span>
        </div>
        <div className="sidebar-icon comment-icon" onClick={handleCommentToggle}><img src={commentIcon} alt="댓글" className="icon-image" /></div>
        <div className="sidebar-icon cart-icon" onClick={handleAddToCart}><img src={cartIcon} alt="장바구니" className="icon-image" /></div>
        <div className="sidebar-icon ai-icon" onClick={handleAISummaryToggle}><img src={summaryAIIcon} alt="AI 요약" className="icon-image" /></div>
      </div>

      {/* 가격 */}
      <div className="price-badge"><span className="price-label">가격</span><span className="price-value">{postData.price.toLocaleString()}₩</span></div>

      {/* 장바구니 토스트 */}
      <div className={`cart-toast ${showCartToast ? "show" : ""}`}>장바구니에 담겼습니다! 🛒</div>

      {/* 댓글 팝업 */}
      <div className={`comments-popup ${showComments ? "active" : ""}`}>
        <div className="comments-header"><h3>댓글 {comments.length>0 && `(${comments.length})`}</h3><button className="close-btn" onClick={handleCommentToggle}>✕</button></div>
        <div className="comments-list">{comments.length===0?<p style={{textAlign:"center",color:"#999",padding:"40px 0"}}>첫 댓글을 남겨보세요!</p>:comments.map(comment=>(<div key={comment.commentId} className="comment-item"><div className="comment-author"><span className="comment-nickname">{comment.userNickname}</span><span className="comment-date">{new Date(comment.commentCreatedAt).toLocaleDateString("ko-KR")}</span></div><p className="comment-text">{comment.commentContent}</p></div>))}</div>
        <div className="comment-input-section"><textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="댓글을 입력하세요..." rows="3"/><button className="submit-btn" onClick={handleCommentSubmit}>댓글 작성</button></div>
      </div>

      {/* AI 요약 */}
      <div className={`ai-summary-popup ${showAISummary ? "active" : ""}`}><div className="ai-summary-header"><h3><span>🤖</span> AI 요약</h3><button className="close-btn" onClick={handleAISummaryToggle}>✕</button></div><div className="ai-summary-content">{postData.aiSummary?<p className="ai-summary-text">{postData.aiSummary}</p>:<p style={{textAlign:"center",color:"#999",padding:"40px 0"}}>AI 요약이 아직 생성되지 않았습니다.</p>}</div></div>
    </div>
  );
};

export default BoardLookupRead;
