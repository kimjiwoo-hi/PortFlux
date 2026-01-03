import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import heartIcon from "../assets/heart.png";
import binheartIcon from "../assets/binheart.png";
import commentIcon from "../assets/comment.png";
import cartIcon from "../assets/cartIcon.png";
import summaryAIIcon from "../assets/summary_AI.svg";
import "./BoardLookupRead.css";
import downloadIcon from "../assets/Downloadcloud.png";
import bookmarkIcon from "../assets/Bookmark.png";
import bookmarkFilledIcon from "../assets/FilldBookmark.png";
import { MoreHorizontal } from "lucide-react";
import UserMiniPopover from "../components/UserMiniPopover";
import user_default_icon from "../assets/user_default_icon.png";

const BoardLookupRead = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [postData, setPostData] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
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
  const [isPurchased, setIsPurchased] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState("");
  // 사용자 프로필 popover state
  const [hoveredAuthor, setHoveredAuthor] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverHoverTimeout = useRef(null);
  const [isPopoverHovered, setIsPopoverHovered] = useState(false);
  const currentAuthorRef = useRef(null);

  // 스크롤 시 팝오버 위치 업데이트
  useEffect(() => {
    const updatePopoverPosition = () => {
      if (hoveredAuthor && currentAuthorRef.current) {
        const rect = currentAuthorRef.current.getBoundingClientRect();
        setPopoverPosition({
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2 - 130,
        });
      }
    };

    if (hoveredAuthor) {
      window.addEventListener('scroll', updatePopoverPosition, true);
      return () => window.removeEventListener('scroll', updatePopoverPosition, true);
    }
  }, [hoveredAuthor]);

  const bottomRef = useRef(null);

  
  // 게시글 데이터 로드
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `http://localhost:8080/api/boardlookup/${postId}?_t=${timestamp}`,
          {
            withCredentials: true,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (response.data) {
          const postData = response.data.post || response.data;
          setPostData(postData);
          setComments(response.data.comments || []);

          const storedUser =
            localStorage.getItem("user") || sessionStorage.getItem("user");
          if (storedUser) {
            const loggedInUser = JSON.parse(storedUser);
            setLoggedInUser(loggedInUser);

            const likeCheckResponse = await axios.get(
              `http://localhost:8080/api/boardlookup/${postId}/like/check`,
              {
                params: { userNum: loggedInUser.userNum },
                withCredentials: true,
              }
            );

            setIsLiked(likeCheckResponse.data.isLiked);
            setLikeCount(likeCheckResponse.data.totalLikes);
          }
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

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedUser || !postId) return;

      const loggedInUser = JSON.parse(storedUser);

      try {
        const response = await axios.get(
          `http://localhost:8080/api/boardlookup/${postId}/purchased`,
          {
            params: { userNum: loggedInUser.userNum },
            withCredentials: true,
          }
        );
        setIsPurchased(response.data.isPurchased);
      } catch (err) {
        console.error("구매 상태 확인 실패:", err);
      }
    };

    checkPurchaseStatus();
  }, [postId]);

  useEffect(() => {
    const checkSaveStatus = async () => {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!storedUser || !postId) return;

      const loggedInUser = JSON.parse(storedUser);

      try {
        const response = await axios.get(
          `http://localhost:8080/api/boardlookup/${postId}/save/check`,
          {
            params: { userNum: loggedInUser.userNum },
            withCredentials: true,
          }
        );
        console.log('Save status response:', response.data);
        setIsSaved(response.data.isSaved === true);
      } catch (err) {
        console.error("저장 상태 확인 실패:", err);
      }
    };

    checkSaveStatus();
  }, [postId]);

  const handleEdit = () => {
    navigate(`/board/lookup/edit/${postId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/boardlookup/posts/${postId}`,
        {
          params: { userNum: loggedInUser.userNum },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert("게시글이 삭제되었습니다.");
        navigate("/");
      }
    } catch (err) {
      console.error("삭제 실패:", err);
      alert(err.response?.data?.message || "게시글 삭제에 실패했습니다.");
    }
  };

  const handleLikeToggle = async () => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    const loggedInUser = JSON.parse(storedUser);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/boardlookup/${postId}/like`,
        null,
        {
          params: { userNum: loggedInUser.userNum },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setLikeCount(response.data.totalLikes);
      }
    } catch (err) {
      console.error("좋아요 에러:", err);
      alert("좋아요 처리 실패");
    }
  };

  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  // 작성자 popover 핸들러
  const handleAuthorMouseEnter = (e) => {
    if (popoverHoverTimeout.current) {
      clearTimeout(popoverHoverTimeout.current);
    }

    // Store the current author element reference
    currentAuthorRef.current = e.currentTarget;

    // Calculate new position (viewport-relative for fixed positioning)
    const rect = e.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.bottom + 10, // viewport-relative position
      left: rect.left + rect.width / 2 - 130,
    };

    // If switching to different user, hide first then update position
    if (hoveredAuthor && hoveredAuthor !== postData.userNickname) {
      setHoveredAuthor(null);
      setTimeout(() => {
        setPopoverPosition(newPosition);
        setHoveredAuthor(postData.userNickname);
      }, 50);
    } else {
      setPopoverPosition(newPosition);
      setHoveredAuthor(postData.userNickname);
    }
  };

  const handleAuthorMouseLeave = () => {
    if (!isPopoverHovered) {
      popoverHoverTimeout.current = setTimeout(() => {
        setHoveredAuthor(null);
      }, 100);
    }
  };

  const handlePopoverMouseEnter = () => {
    if (popoverHoverTimeout.current) {
      clearTimeout(popoverHoverTimeout.current);
    }
    setIsPopoverHovered(true);
  };

  const handlePopoverMouseLeave = () => {
    setIsPopoverHovered(false);
    setHoveredAuthor(null);
    currentAuthorRef.current = null;
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
    setShowAISummary(false);
  };

  const handleAISummaryToggle = () => {
    setShowAISummary(!showAISummary);
    setShowComments(false);
  };

  const handleDownload = async () => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const loggedInUser = JSON.parse(storedUser);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/boardlookup/${postId}/download`,
        {
          params: { userNum: loggedInUser.userNum },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", postData.postFile || "download.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("다운로드가 완료되었습니다! 📥");
    } catch (err) {
      if (err.response?.status === 403) {
        alert("구매하지 않은 게시물입니다.");
      } else {
        alert("다운로드에 실패했습니다.");
      }
    }
  };

  const handleAddToCart = async () => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    try {
      console.log("장바구니 추가 요청:", {
        url: `http://localhost:8080/api/cart/items`,
        userNum: user.userNum,
        productId: postId,
      });
      const response = await axios.post(
        `http://localhost:8080/api/cart/items`,
        { productId: parseInt(postId) },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("장바구니 추가 성공:", response.data);
      setShowCartToast(true);
      setTimeout(() => setShowCartToast(false), 3000);
    } catch (err) {
      console.error("장바구니 추가 실패:", err);

      if (err.response?.status === 409) {
        alert("이미 장바구니에 담긴 항목입니다.");
      } else if (err.response?.status === 404) {
        alert("API 엔드포인트를 찾을 수 없습니다.");
      } else if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert(
          `장바구니 추가에 실패했습니다: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  const handleToggleSave = async () => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const loggedInUser = JSON.parse(storedUser);

    try {
      console.log('Toggling save for post:', postId);
      
      const response = await axios.post(
        `http://localhost:8080/api/boardlookup/${postId}/save`,
        null,
        {
          params: { userNum: loggedInUser.userNum },
          withCredentials: true,
        }
      );

      console.log('Save toggle response:', response.data);

      if (response.data.success) {
        setIsSaved(response.data.isSaved === true);

        if (response.data.isSaved === true) {
          setSaveToastMessage("게시글이 저장되었습니다! 🔖");
        } else {
          setSaveToastMessage("저장이 취소되었습니다.");
        }

        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
      }
    } catch (err) {
      console.error("저장 실패:", err);
      console.error("Error response:", err.response?.data);
      alert("저장 처리에 실패했습니다.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    const loggedInUser = JSON.parse(storedUser);

    try {
      await axios.post(
        `http://localhost:8080/api/boardlookup/${postId}/comments`,
        { userNum: loggedInUser.userNum, content: newComment },
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

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        await axios.delete(
          `http://localhost:8080/api/boardlookup/comments/${commentId}`,
          {
            params: { userNum: loggedInUser.userNum },
            withCredentials: true,
          }
        );
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== commentId)
        );
      } catch (err) {
        console.error("댓글 삭제 실패:", err);
        alert(err.response?.data?.message || "댓글 삭제에 실패했습니다.");
      }
    }
  };

  const handlePdfScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10)
      setCurrentPage((p) => p + 1);
  };

  if (loading)
    return (
      <div
        className="board-lookup-read"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p style={{ color: "#191919", fontSize: "18px" }}>로딩 중...</p>
      </div>
    );

  if (error || !postData)
    return (
      <div
        className="board-lookup-read"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p style={{ color: "#191919", fontSize: "18px" }}>
          {error || "게시글을 찾을 수 없습니다."}
        </p>
      </div>
    );

  let tagsArray = [];
  try {
    tagsArray =
      typeof postData.tags === "string"
        ? JSON.parse(postData.tags)
        : postData.tags || [];
  } catch (e) {
    console.error("태그 파싱 실패:", e);
  }

  const userImageSrc = postData.userImageBase64
    ? `data:image/jpeg;base64,${postData.userImageBase64}`
    : user_default_icon;

  return (
    <div className="board-lookup-read">
      <div
        className={`overlay-background ${
          showComments || showAISummary ? "active" : ""
        }`}
      />

      <div className={`post-header ${!headerVisible ? "hidden" : ""}`}>
        <div className="author-info">
          <div className="profile-wrapper">
            <div className="profile-left">
              <div className="profile-top">
                <div
                  className="user_default_icon"
                  onClick={() => navigate(`/user/${postData.userNum}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={userImageSrc}
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    className={`follow-btn ${isFollowing ? "following" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle();
                    }}
                  >
                    {isFollowing ? "✓" : "+"}
                  </button>
                </div>
                <div
                  className="nickname"
                    onMouseEnter={handleAuthorMouseEnter}
                    onMouseLeave={handleAuthorMouseLeave}
                  onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/mypage/${postData.userNickname}`);
                    }}
                  style={{ cursor: "pointer" }}
                >
                  {postData.userNickname}
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <h1 className="post-title">{postData.title}</h1>
          </div>
        </div>
        <div className="tags-section">
          {tagsArray.map((tag, i) => (
            <span key={i} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="pdf-viewer" onScroll={handlePdfScroll}>
          <div className="pdf-page">
            <div className="pdf-content">
              {postData.postFile ? (
                (() => {
                  const isPdf = /\.pdf$/i.test(postData.postFile);
                  const isPpt = /\.(ppt|pptx)$/i.test(postData.postFile);
                  
                  // ⭐ PDF 또는 PPT 미리보기
                  if ((isPdf || isPpt) && Array.isArray(postData.pdfImages) && postData.pdfImages.length > 0) {
                    return (
                      <div className="pdf-preview-container">
                        <h3 className="preview-title" style={{ 
                          fontSize: "1.5rem", 
                          fontWeight: "600", 
                          marginBottom: "1.5rem",
                          color: "#1f2937",
                          borderBottom: "2px solid #3b82f6",
                          paddingBottom: "0.5rem"
                        }}>
                          {isPdf ? 'PDF 미리보기' : 'PPT 미리보기'}
                        </h3>
                        <div className="pdf-image-wrapper">
                          {postData.pdfImages.map((imgUrl, index) => {
                            const fullImageUrl = imgUrl.startsWith("http")
                              ? imgUrl
                              : `http://localhost:8080${imgUrl}`;

                            return (
                              <div key={index} className="pdf-page-item" style={{
                                marginBottom: "2rem",
                                background: "#fff",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                overflow: "hidden",
                                transition: "transform 0.2s"
                              }}>
                                <img
                                  src={fullImageUrl}
                                  alt={`${isPdf ? 'PDF 페이지' : 'PPT 슬라이드'} ${index + 1}`}
                                  className="pdf-page-image"
                                  loading="lazy"
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    display: "block"
                                  }}
                                  onError={(e) => {
                                    console.error(`이미지 로드 실패: ${fullImageUrl}`);
                                    e.target.src = "https://via.placeholder.com/800x600?text=Image+Load+Failed";
                                  }}
                                />
                                <p className="page-number" style={{
                                  textAlign: "center",
                                  padding: "0.75rem",
                                  background: "#f3f4f6",
                                  fontWeight: "500",
                                  color: "#6b7280",
                                  margin: 0
                                }}>
                                  {isPdf ? '페이지' : '슬라이드'} {index + 1}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } 
                  // ⭐ 미리보기가 없는 경우
                  else if (isPpt) {
                    return (
                      <div className="no-preview" style={{ 
                        background: "#f9fafb",
                        border: "2px dashed #d1d5db",
                        borderRadius: "12px",
                        padding: "3rem",
                        textAlign: "center"
                      }}>
                        <h3 style={{ color: "#191919", marginBottom: "1rem" }}>
                          PPT 파일 미리보기 준비 중...
                        </h3>
                        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
                          이미지 변환이 완료되면 자동으로 표시됩니다.
                        </p>
                        <p className="file-type-info" style={{
                          fontSize: "0.875rem",
                          color: "#9ca3af",
                          fontStyle: "italic"
                        }}>
                          파일: {postData.postFile}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ textAlign: "center", padding: "50px" }}>
                        <h3 style={{ color: "#191919" }}>
                          지원하지 않는 파일 형식입니다.
                        </h3>
                      </div>
                    );
                  }
                })()
              ) : (
                <>
                  <p
                    style={{
                      fontSize: "48px",
                      fontWeight: "300",
                      color: "#191919",
                      marginBottom: "20px",
                    }}
                  >
                    {postData.title}
                  </p>
                  <p style={{ color: "#666", fontSize: "15px" }}>
                    조회수: {postData.viewCnt} | 다운로드:{" "}
                    {postData.downloadCnt}
                  </p>
                </>
              )}
            </div>
          </div>

          {currentPage > 1 && (
            <div className="pdf-page">
              <div className="pdf-content">
                <p
                  style={{
                    fontSize: "36px",
                    color: "#191919",
                    marginBottom: "20px",
                  }}
                >
                  페이지 {currentPage}
                </p>
                <p
                  style={{ color: "#333", fontSize: "15px", lineHeight: "1.8" }}
                >
                  {postData.content}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`sidebar ${!sidebarVisible ? "hidden" : ""}`}>
        <div
          className={`sidebar-icon heart-icon ${isLiked ? "liked" : ""}`}
          onClick={handleLikeToggle}
        >
          <img
            src={isLiked ? heartIcon : binheartIcon}
            alt="좋아요"
            className="icon-image"
          />
          <span className="like-count">{likeCount}</span>
        </div>
        <div
          className="sidebar-icon comment-icon"
          onClick={handleCommentToggle}
        >
          <img src={commentIcon} alt="댓글" className="icon-image" />
        </div>
        {isPurchased ? (
          <div className="sidebar-icon download-icon" onClick={handleDownload}>
            <img src={downloadIcon} alt="다운로드" className="icon-image" />
          </div>
        ) : (
          <div className="sidebar-icon cart-icon" onClick={handleAddToCart}>
            <img src={cartIcon} alt="장바구니" className="icon-image" />
          </div>
        )}

        <div
          className="sidebar-icon bookmark-icon"
          onClick={handleToggleSave}
          style={{
            backgroundColor: isSaved
              ? "#ffffffff"
              : "rgba(255, 255, 255, 0.95)",
          }}
        >
          <img
            src={isSaved ? bookmarkFilledIcon : bookmarkIcon}
            alt="저장"
            className="icon-image"
          />
        </div>

        <div className="sidebar-icon ai-icon" onClick={handleAISummaryToggle}>
          <img src={summaryAIIcon} alt="AI 요약" className="icon-image" />
        </div>
      </div>

      <div className="price-badge">
        <span className="price-label">가격</span>
        <span className="price-value">{postData.price.toLocaleString()}₩</span>
      </div>

      <div className={`cart-toast ${showCartToast ? "show" : ""}`}>
        장바구니에 담겼습니다! 🛒
      </div>

      <div className={`cart-toast ${showSaveToast ? "show" : ""}`}>
        {saveToastMessage}
      </div>

      <div className={`comments-popup ${showComments ? "active" : ""}`}>
        <div className="comments-header">
          <h3>댓글 {comments.length > 0 && `(${comments.length})`}</h3>
          <button className="close-btn" onClick={handleCommentToggle}>
            ✕
          </button>
        </div>
        <div className="comments-list">
          {comments.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "#999", padding: "40px 0" }}
            >
              첫 댓글을 남겨보세요!
            </p>
          ) : (
            comments.map((comment) => {
              const commentUserImageSrc = comment.userImageBase64
                ? `data:image/jpeg;base64,${comment.userImageBase64}`
                : user_default_icon;

              return (
                <div key={comment.commentId} className="comment-item">
                  <div className="comment-author">
                    <div
                      className="comment-author-profile"
                      onClick={() => navigate(`/user/${comment.userNum}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={commentUserImageSrc}
                        alt={comment.userNickname}
                        className="comment-profile-pic"
                      />
                      <span className="comment-nickname">
                        {comment.userNickname}
                      </span>
                    </div>
                    <div className="comment-meta">
                      <span className="comment-date">
                        {new Date(comment.commentCreatedAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </span>
                      {loggedInUser &&
                        loggedInUser.userNum === comment.userNum && (
                          <button
                            className="comment-delete-btn"
                            onClick={() =>
                              handleDeleteComment(comment.commentId)
                            }
                          >
                            삭제
                          </button>
                        )}
                    </div>
                  </div>
                  <p className="comment-text">{comment.commentContent}</p>
                </div>
              );
            })
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
            댓글 작성
          </button>
        </div>
      </div>

      <div className={`ai-summary-popup ${showAISummary ? "active" : ""}`}>
        <div className="ai-summary-header">
          <h3>
            <span>📝</span> 게시물 설명
          </h3>
          <button className="close-btn" onClick={handleAISummaryToggle}>
            ✕
          </button>
        </div>
        <div className="ai-summary-content">
          <div className="summary-section">
            <h4 className="summary-section-title">게시물 내용</h4>
            {postData.content ? (
              <p className="summary-content-text">{postData.content}</p>
            ) : (
              <p className="summary-placeholder-text">
                작성된 내용이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 프로필 미니 팝오버 */}
      <UserMiniPopover
        nickname={hoveredAuthor}
        isVisible={!!hoveredAuthor}
        position={popoverPosition}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      />

      <div
        ref={bottomRef}
        style={{
          height: "200px",
          width: "100%",
          pointerEvents: "none",
        }}
      />

      {loggedInUser &&
        Number(loggedInUser.userNum) === Number(postData.userNum) && (
          <div className="post-bottom-actions">
            <button className="edit-btn" onClick={handleEdit}>
              수정
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              삭제
            </button>
          </div>
        )}
    </div>
  );
};

export default BoardLookupRead;