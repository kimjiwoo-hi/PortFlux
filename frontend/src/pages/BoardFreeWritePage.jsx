import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Paperclip, Image as ImageIcon, ArrowLeft, X } from "lucide-react"; 
import "./BoardFreeWritePage.css";

const BoardFreeWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postToEdit = location.state?.postToEdit;

  // 상태 관리
  const [isEditMode] = useState(!!postToEdit);
  const [title, setTitle] = useState(postToEdit ? postToEdit.title : "");
  const [content, setContent] = useState(postToEdit ? postToEdit.content : "");
  // 공지사항 체크박스: 새 글 작성시 무조건 false (체크 해제)
  // 수정시에만 기존 boardType 사용하되, 관리자 글이 자동으로 notice로 표시되는 문제 방지
  const [isNotice, setIsNotice] = useState(false);
  
  // [린트 해결] 변수명을 대문자로 변경하고 실제 로직에서 사용함
  const [USER_ROLE] = useState(() => {
    return localStorage.getItem("role") || sessionStorage.getItem("role") || "USER";
  });

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const imageInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 1. 로그인 여부 확인 및 접근 제어
  useEffect(() => {
    const isLogin = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    if (!isLogin) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login", { state: { from: "/boardfree/write" } });
    }
  }, [navigate]);

  // 2. 파일 업로드 관련 핸들러
  const handleFileButtonClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
          alert("20MB 이하의 파일만 업로드할 수 있습니다.");
          e.target.value = null; 
          return;
      }
      setSelectedFile(file);
    }
  };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. 이미지 업로드 및 미리보기 핸들러
  const handleImageButtonClick = () => imageInputRef.current.click();
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const img = e.target.files[0];
      if (img.size > 10 * 1024 * 1024) {
          alert("10MB 이하의 이미지만 업로드할 수 있습니다.");
          e.target.value = null; 
          return;
      }
      setSelectedImage(img);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); };
      reader.readAsDataURL(img);
    }
  };
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // 4. 게시글 등록/수정 전송 핸들러 (useCallback 적용으로 린트 에러 해결)
  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const userNum = localStorage.getItem("userNum") || sessionStorage.getItem("userNum");
    if (!userNum) {
      alert("로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.");
      navigate("/login"); 
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userId", userNum);
    formData.append("boardType", isNotice ? 'notice' : 'free');
    
    // [사용처 확인] USER_ROLE을 formData에 추가하여 린트 에러 및 백엔드 로직 해결
    formData.append("role", USER_ROLE); 
    
    if (selectedFile) formData.append("file", selectedFile); 
    if (selectedImage) formData.append("image", selectedImage);

    let url = "http://localhost:8080/api/board/free/write";
    let method = "POST";

    if (isEditMode) {
      url = "http://localhost:8080/api/board/free/update";
      method = "PUT";
      formData.append("postId", postToEdit.postId);
    }

    try {
      const response = await fetch(url, { method: method, body: formData });
      if (response.ok) {
        alert(isEditMode ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
        navigate("/boardfree");
      } else {
        const errorText = await response.text();
        alert("실패: " + errorText);
      }
    } catch (error) {
      console.error("게시글 처리 중 오류 발생:", error);
      alert("서버 통신 오류가 발생했습니다.");
    }
  }, [title, content, isNotice, USER_ROLE, selectedFile, selectedImage, isEditMode, postToEdit, navigate]);

  return (
    <div className="page-wrapper">
      <div className="write-container">
        {/* 헤더 영역 */}
        <div className="write-header-row">
          <button className="back-btn" onClick={() => navigate(-1)} style={{border:'none', background:'none', cursor:'pointer', marginRight:'10px'}}>
              <ArrowLeft size={24} />
          </button>
          <h2 className="write-header-title">{isEditMode ? "게시글 수정" : "게시글 작성"}</h2>
          
          {/* 관리자일 경우 공지사항 옵션 노출 */}
          {USER_ROLE === 'ADMIN' && (
            <div className="notice-option">
              <input 
                type="checkbox" 
                id="notice-check"
                checked={isNotice} 
                onChange={(e) => setIsNotice(e.target.checked)} 
              />
              <label htmlFor="notice-check" style={{marginLeft: '5px', fontSize: '14px', cursor: 'pointer'}}>
                공지사항으로 등록
              </label>
            </div>
          )}
        </div>

        {/* 작성 폼 영역 */}
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
          
          {/* 툴바 영역 */}
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <input type="file" ref={imageInputRef} accept="image/*" style={{display: 'none'}} onChange={handleImageChange} />
              <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />
              
              <button className="tool-btn" onClick={handleImageButtonClick}>
                <ImageIcon size={18} /> 사진
              </button>
              <button className="tool-btn" onClick={handleFileButtonClick}>
                <Paperclip size={18} /> 파일
              </button>
              
              {/* 첨부파일 칩 */}
              {selectedFile && (
                <div className="file-info-chip">
                  <span className="file-name">📄 {selectedFile.name} ({(selectedFile.size/1024/1024).toFixed(1)}MB)</span>
                  <button className="file-remove-btn" onClick={handleRemoveFile}><X size={14} /></button>
                </div>
              )}
            </div>
          </div>

          {/* 본문 에디터 영역 */}
          <div className="editor-area" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 이미지 미리보기 */}
            {imagePreview && (
                <div style={{ padding: '10px', position: 'relative', width: 'fit-content' }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '300px', borderRadius: '4px' }} />
                    <button onClick={handleRemoveImage} style={{ position: 'absolute', top: 15, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '5px' }}>
                      <X size={14}/>
                    </button>
                </div>
            )}
            <textarea 
              className="write-textarea"
              placeholder="내용을 입력하세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          {/* 하단 버튼 */}
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