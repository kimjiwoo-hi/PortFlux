import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Image as ImageIcon, Video, Smile, Italic, List, Bold } from "lucide-react";
import "./BoardFreeWritePage.css";

const BoardFreeWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postToEdit = location.state?.postToEdit;

  const [isEditMode] = useState(!!postToEdit);
  const [title, setTitle] = useState(postToEdit ? postToEdit.title : "");
  const [content, setContent] = useState(postToEdit ? postToEdit.content : "");
  const [isNotice, setIsNotice] = useState(postToEdit ? postToEdit.board_type === 'notice' : false);

  // 로그인 체크
  useEffect(() => {
    const isLogin = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    if (!isLogin) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login", { state: { from: "/boardfree/write" } });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 작성자 정보 가져오기
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    
    // 백엔드로 전송할 데이터 구성
    const postData = {
      title: title,
      content: content,
      userId: userId, // 백엔드에서 user_num을 찾기 위해 ID 전송
      boardType: isNotice ? 'notice' : 'free'
    };

    try {
      let url = "http://localhost:8080/api/board/write";
      let method = "POST";

      if (isEditMode) {
        url = "http://localhost:8080/api/board/update"; // 수정 API URL
        method = "PUT";
        postData.postId = postToEdit.post_id; // 수정할 ID 추가
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json" // [수정] 명시적 Accept 헤더 추가
        },
        // [수정] 중요: CORS 요청 시 쿠키(세션)를 주고받기 위해 credentials 포함
        credentials: 'include', 
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert(isEditMode ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
        navigate("/boardfree");
      } else {
        // 에러 응답 텍스트 확인
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        
        if (response.status === 403) {
            alert("권한이 없습니다. (403 Forbidden)\n서버의 Security 설정을 확인해주세요.");
        } else {
            alert("처리에 실패했습니다: " + errorText);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 연결 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="write-container">
        <div className="write-header-row">
          <h2 className="write-header-title">
            {isEditMode ? "게시글 수정" : "게시글 작성"}
          </h2>
          <label className="notice-checkbox">
              <input 
                type="checkbox" 
                checked={isNotice} 
                onChange={(e) => setIsNotice(e.target.checked)} 
              />
              공지사항으로 등록
            </label>
        </div>

        <div className="write-form">
          <div className="form-group">
            <input 
              type="text" 
              className="write-input title-input" 
              placeholder="제목을 입력해 주세요." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button className="tool-btn"><ImageIcon size={18} /> 사진</button>
              <button className="tool-btn"><Video size={18} /> 동영상</button>
              <button className="tool-btn"><Smile size={18} /> 이모티콘</button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group icon-only">
              <button className="tool-btn"><Bold size={18} /></button>
              <button className="tool-btn"><Italic size={18} /></button>
              <button className="tool-btn"><List size={18} /></button>
            </div>
          </div>

          <div className="editor-area">
            <textarea 
              className="write-textarea"
              placeholder="내용을 입력하세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          <div className="write-footer">
            <button className="btn-submit" onClick={handleSubmit}>
              {isEditMode ? "수정 완료" : "등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardFreeWritePage;