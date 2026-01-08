import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, PenLine, Paperclip, Image as ImageIcon } from "lucide-react"; 
import "./BoardFreePage.css";

const BoardFreePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchPosts = async (keyword = "") => {
    setIsLoading(true);
    try {
      const url = keyword 
        ? `http://localhost:8080/api/board/free/list?keyword=${encodeURIComponent(keyword)}` 
        : 'http://localhost:8080/api/board/free/list';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("서버 응답 오류:", response.status);
        setPosts([]); // 에러 발생 시 빈 배열로 초기화하여 500 에러 시에도 화면이 깨지지 않게 함
      }
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = () => {
    fetchPosts(searchKeyword);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 공지사항과 일반 게시글 분리 (백엔드에서 이미 정렬됨)
  const noticePosts = posts.filter(p => p.boardType === 'notice');
  const normalPosts = posts.filter(p => p.boardType !== 'notice');

  let displayPosts = [];
  if (activeTab === "notice") {
    displayPosts = noticePosts;
  } else {
    // 백엔드에서 이미 정렬된 순서 유지: 공지사항 먼저, 그 다음 최신 일반글
    displayPosts = posts;
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = displayPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(displayPosts.length / postsPerPage);

  const handlePostClick = (postId) => {
    navigate(`/boardfree/${postId}`);
  };

  const goToUserPage = (e, userNickname) => {
    e.stopPropagation();
    if (userNickname) {
      navigate(`/mypage/${userNickname}`);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="board-container">
        <div className="board-toolbar">
          <div className="board-tabs">
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => { setActiveTab("all"); setCurrentPage(1); }}>전체글</button>
            <button className={`tab-btn ${activeTab === "notice" ? "active" : ""}`} onClick={() => { setActiveTab("notice"); setCurrentPage(1); }}>공지</button>
          </div>

          <div className="board-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="검색어를 입력하세요" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="search-btn" onClick={handleSearch}>
                <Search size={18} />
              </button>
            </div>
            
            <button className="write-btn" onClick={() => navigate("/boardfree/write")}>
              <PenLine size={16} style={{ marginRight: "6px" }} />
              글쓰기
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{textAlign:"center", padding:"50px"}}>데이터를 불러오는 중...</div>
        ) : (
          <table className="board-table">
            {/* [수정 핵심] colgroup 내부의 모든 공백과 주석을 제거하여 리액트 경고 해결 */}
            <colgroup><col width="55%" /><col width="15%" /><col width="15%" /><col width="7%" /><col width="8%" /></colgroup>
            <thead>
              <tr>
                <th className="th-title">Title</th>
                <th className="th-writer">Writer</th>
                <th className="th-date">Date</th>
                <th className="th-views">Views</th>
                <th className="th-likes">Likes</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <tr 
                    key={post.postId} 
                    className={post.boardType === 'notice' ? 'tr-notice' : 'tr-clickable'}
                    onClick={() => handlePostClick(post.postId)}
                  >
                    <td className="td-title">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {post.boardType === 'notice' && <span className="notice-badge" style={{marginRight:'8px'}}>공지</span>}
                        
                        <span className="post-text" style={{ 
                          fontWeight: post.boardType === 'notice' ? 'bold' : 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {post.title}
                          
                          {/* 댓글 개수 표시 */}
                          {post.commentCnt > 0 && (
                            <span className="comment-count-red" style={{ 
                              color: '#ef4444', 
                              fontWeight: 'bold', 
                              marginLeft: '5px',
                              fontSize: '14px' 
                            }}>
                              [{post.commentCnt > 999 ? '999+' : post.commentCnt}]
                            </span>
                          )}
                        </span>
                        
                        <div className="post-icons" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                          {post.image && <ImageIcon size={14} color="#999" />}
                          {post.postFile && <Paperclip size={14} color="#999" />}
                        </div>
                      </div>
                    </td>
                    
                    <td className="td-writer">
                      <span
                        className="writer-link"
                        onClick={(e) => goToUserPage(e, post.userNickname)}
                        style={{ cursor: 'pointer', fontWeight: '500' }}
                      >
                        {post.userNickname || "익명"}
                      </span>
                    </td>
                    
                    <td className="td-date">{post.createdAt ? post.createdAt.substring(0, 10) : "-"}</td>
                    <td className="td-views">{post.viewCnt || 0}</td>
                    <td className="td-likes">{post.likeCnt || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: "60px", textAlign: "center", color: "#888" }}>등록된 게시글이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="pagination">
          {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button key={number} className={`page-num ${currentPage === number ? "active" : ""}`} onClick={() => setCurrentPage(number)}>
              {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardFreePage;