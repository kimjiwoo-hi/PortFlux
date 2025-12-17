import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, PenLine, Image as ImageIcon, FileText } from "lucide-react";
import "./BoardFreePage.css";

const BoardFreePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  // [수정] DB 데이터를 담을 state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // [수정] 컴포넌트 마운트 시 DB에서 게시글 목록 Fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // 백엔드 API 호출 (URL은 상황에 맞춰 조정 필요)
      const response = await fetch("http://localhost:8080/api/board/list"); 
      if (response.ok) {
        const data = await response.json();
        setPosts(data); // DB에서 가져온 배열로 상태 업데이트
      } else {
        console.error("게시글 로딩 실패");
      }
    } catch (error) {
      console.error("서버 통신 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 공지사항과 일반글 분리
  const noticePosts = posts.filter(p => p.board_type === 'notice');
  const normalPosts = posts.filter(p => p.board_type !== 'notice')
                           .sort((a, b) => b.post_id - a.post_id); // 최신순 정렬

  let displayPosts = [];
  if (activeTab === "notice") {
    displayPosts = noticePosts;
  } else {
    displayPosts = [...noticePosts, ...normalPosts];
  }

  // 페이지네이션 로직
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(displayPosts.length / postsPerPage);

  const handlePostClick = (postId) => {
    navigate(`/boardfree/${postId}`);
  };

  return (
    <div className="page-wrapper">
      <div className="board-container">
        <div className="board-toolbar">
          <div className="board-tabs">
            <button 
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
            >
              전체글
            </button>
            <button 
              className={`tab-btn ${activeTab === "notice" ? "active" : ""}`}
              onClick={() => { setActiveTab("notice"); setCurrentPage(1); }}
            >
              공지
            </button>
          </div>

          <div className="board-actions">
            <div className="search-box">
              <input type="text" placeholder="검색어를 입력하세요" />
              <button className="search-btn"><Search size={18} /></button>
            </div>
            
            {/* 데이터 초기화 버튼 삭제됨 */}
            
            <button className="write-btn" onClick={() => navigate("/boardfree/write")}>
              <PenLine size={16} style={{ marginRight: "6px" }} />
              글쓰기
            </button>
          </div>
        </div>

        {/* 로딩 상태 표시 */}
        {isLoading ? (
          <div style={{textAlign:"center", padding:"50px"}}>데이터를 불러오는 중...</div>
        ) : (
          <table className="board-table">
            <thead>
              <tr>
                <th className="th-no">No.</th>
                <th className="th-title">Title</th>
                <th className="th-writer">Writer</th>
                <th className="th-date">Date</th>
                <th className="th-views">Views</th>
                <th className="th-likes">Likes</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.length > 0 ? (
                currentPosts.map((post, index) => (
                  <tr 
                    key={post.post_id} 
                    className={post.board_type === 'notice' ? 'tr-notice' : 'tr-clickable'}
                    onClick={() => handlePostClick(post.post_id)}
                  >
                    <td className="td-no">
                      {post.board_type === 'notice' 
                        ? <span className="notice-badge">공지</span> 
                        : normalPosts.length - indexOfFirstPost - index 
                      }
                    </td>
                    <td className="td-title">
                      <span className="post-text">
                        {post.title}
                        {post.comment_cnt > 0 && (
                          <span className="comment-cnt">[{post.comment_cnt}]</span>
                        )}
                      </span>
                      <div className="post-icons">
                        {post.hasImage && <ImageIcon size={14} className="icon-img" />}
                      </div>
                    </td>
                    <td className="td-writer">{post.user_nickname}</td>
                    <td className="td-date">
                        {/* 날짜 포맷팅: YYYY-MM-DD 형식으로 자르기 (필요시 수정) */}
                        {post.created_at ? post.created_at.substring(0, 10) : ""}
                    </td>
                    <td className="td-views">{post.view_cnt}</td>
                    <td className="td-likes">{post.like_cnt || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: "60px", textAlign: "center", color: "#888" }}>
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="pagination">
          {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              className={`page-num ${currentPage === number ? "active" : ""}`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardFreePage;