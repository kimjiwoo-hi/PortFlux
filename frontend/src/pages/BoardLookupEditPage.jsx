import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload, X, FileText, CheckCircle, Sparkles } from "lucide-react";
import "./BoardLookupEditPage.css";
import { tagData } from "../database/taglist.js";

export default function BoardLookupEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [price, setPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const allTags = useMemo(() => {
    return Object.values(tagData).flat();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/boardlookup/${postId}`, { withCredentials: true });
        const postData = response.data.post;
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setPrice(postData.price.toString());
        setTags(postData.tags ? JSON.parse(postData.tags) : []);
      } catch (error) {
        console.error("게시글 정보를 불러오는 데 실패했습니다.", error);
        alert("게시글 정보를 불러오는 데 실패했습니다.");
        navigate(-1);
      }
    };
    fetchPost();
  }, [postId, navigate]);

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setPrice("");
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const roundedValue = Math.round(numValue / 100) * 100;
      setPrice(roundedValue.toString());
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else if (file) {
      alert("PDF 파일만 업로드할 수 있습니다.");
      e.target.value = null;
      setSelectedFile(null);
    }
  };
  
    const handleGenerateAiSummary = async () => {
    if (!selectedFile && !post.postFile) {
      alert("먼저 PDF 파일을 업로드해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
        const formData = new FormData();
        
        // 새 파일이 있으면 사용, 없으면 기존 파일로 요청 (이 부분은 백엔드 구현에 따라 달라짐)
        // 백엔드가 파일 이름으로 서버에 저장된 파일을 찾을 수 있다면 아래 로직이 유효.
        // 그렇지 않다면, 이 기능은 새 파일을 업로드했을 때만 활성화해야 함.
        if (selectedFile) {
            formData.append("pdf", selectedFile);
        } else {
            // 이 부분은 백엔드에서 파일 이름(post.postFile)으로 분석을 지원해야 가능
            alert("AI 요약은 새 PDF 파일을 업로드할 때만 가능합니다.");
            setIsAnalyzing(false);
            return;
        }

      const response = await axios.post("/api/pdf/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success === "true") {
        setContent(response.data.aiSummary);
      } else {
        alert("AI 요약 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("AI 요약 생성 오류:", error);
      alert(
        "AI 요약 생성 중 오류가 발생했습니다: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.trim()) {
      const filteredSuggestions = allTags.filter(
        (tag) =>
          tag.toLowerCase().includes(value.toLowerCase()) && !tags.includes(tag)
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagToAdd) => {
    if (tagToAdd && !tags.includes(tagToAdd) && allTags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setTagInput("");
      setSuggestions([]);
    } else if (tagToAdd && !allTags.includes(tagToAdd)) {
      alert("등록되지 않은 태그입니다. 아래 목록에서 선택해주세요.");
      setTagInput("");
      setSuggestions([]);
    }
  };

  const handleAddTagOnEnter = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        addTag(suggestions[0]);
      } else {
        addTag(tagInput.trim());
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!price || price <= 0) {
      alert("가격을 입력해주세요.");
      return;
    }

    setIsUploading(true);
    
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      setIsUploading(false);
      return;
    }
    const loggedInUser = JSON.parse(storedUser);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("title", title);
      formData.append("content", content);
      formData.append("price", parseInt(price));
      formData.append("userNum", loggedInUser.userNum);
      formData.append("tags", JSON.stringify(tags));

      const response = await axios.put(`/api/boardlookup/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        alert("게시글이 성공적으로 수정되었습니다.");
        navigate(`/board/lookup/${postId}`);
      } else {
        alert("게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 수정 오류:", error);
      alert("게시글 수정 중 오류가 발생했습니다: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };
  
    const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  if (!post) {
    return <div>게시글을 불러오는 중...</div>;
  }

  return (
    <div className="board-lookup-write-page">
          <header className="page-header">
        <h1 className="page-title">게시물 수정</h1>
      </header>

      <div className="page-container">
        <div className="content-grid">
          <div className="upload-section">
            <div className="image-upload-area">
                <div className="pdf-preview">
                  <div className="pdf-icon-container">
                    <FileText size={80} color="#ef4444" />
                  </div>
                  <div className="pdf-info">
                   <div className="pdf-success">
                        <CheckCircle size={20} color="#10b981" />
                        <span>{selectedFile ? "새 PDF 선택됨" : "기존 PDF 유지"}</span>
                    </div>
                    <p className="pdf-filename">{selectedFile ? selectedFile.name : post.postFile}</p>
                    {selectedFile && <p className="pdf-filesize">{formatFileSize(selectedFile.size)}</p>}
                     <label className="file-select-button" style={{marginTop: "15px"}}>
                        다른 파일 선택
                        <input type="file" accept=".pdf" onChange={handleImageUpload} className="file-input" />
                    </label>
                  </div>
                </div>
            </div>
            <div className="feature-description">
              <p>• 새 PDF 업로드 시 자동으로 페이지별 이미지 변환</p>
              <p>• 태그를 수정하여 검색 최적화</p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label className="form-label">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-input"
                placeholder="내용을 입력하세요"
                rows="5"
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                태그 추가 (등록된 태그만 선택 가능)
              </label>
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleAddTagOnEnter}
                  className="form-input"
                  placeholder="태그 검색 후 Enter 또는 아래에서 선택"
                />
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => addTag(suggestion)}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="tag-remove"
                    >
                      <X className="tag-remove-icon" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">가격 (₩)</label>
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                className="form-input"
                placeholder="가격을 입력하세요 (100원 단위)"
                min="0"
                step="100"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!title || !price || isUploading}
              className="submit-button"
            >
              {isUploading ? "수정 중..." : "게시글 수정"}
            </button>
          </div>
        </div>

        <div className="full-tag-list-container">
          {Object.entries(tagData).map(([category, tagList]) => (
            <div key={category} className="tag-category-section">
              <h3 className="tag-category-title">{category}</h3>
              <div className="clickable-tags-list">
                {(expandedCategories[category]
                  ? tagList
                  : tagList.slice(0, 10)
                ).map(
                  (tag) =>
                    !tags.includes(tag) && (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="clickable-tag"
                      >
                        {tag}
                      </button>
                    )
                )}
              </div>
              {tagList.length > 10 && (
                <button
                  onClick={() => toggleCategory(category)}
                  className="toggle-tags-button"
                >
                  {expandedCategories[category] ? "접기" : "더 보기"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
