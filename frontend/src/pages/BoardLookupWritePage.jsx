import React, { useState, useMemo } from "react";
import { Upload, X, FileText, CheckCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BoardLookupWritePage.css";
import { tagData } from "../database/taglist.js";

export default function BoardLookupWritePage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [price, setPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const allTags = useMemo(() => {
    return Object.values(tagData).flat();
  }, []);

  // price onChange 핸들러 수정
  const handlePriceChange = (e) => {
    const value = e.target.value;
    // 빈 값이면 그대로 설정
    if (value === "") {
      setPrice("");
      return;
    }

    // 숫자로 변환하고 100원 단위로 반올림
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const roundedValue = Math.round(numValue / 100) * 100;
      setPrice(roundedValue.toString());
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = [".pdf"];
      const fileExtension = `.${file.name.split(".").pop()}`;

      if (allowedExtensions.includes(fileExtension.toLowerCase())) {
        setSelectedFile(file);
      } else {
        alert("PDF 파일만 업로드할 수 있습니다.");
        e.target.value = null;
        setSelectedFile(null);
      }
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!selectedFile) {
      alert("먼저 PDF 파일을 업로드해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);

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
    // ✅ 미리 정의된 태그 목록에 있는지 확인
    if (tagToAdd && !tags.includes(tagToAdd) && allTags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setTagInput("");
      setSuggestions([]);
    } else if (tagToAdd && !allTags.includes(tagToAdd)) {
      // ✅ 정의되지 않은 태그일 경우 경고
      alert("등록되지 않은 태그입니다. 아래 목록에서 선택해주세요.");
      setTagInput("");
      setSuggestions([]);
    }
  };

  const handleAddTagOnEnter = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      // ✅ 자동완성 목록에서 첫 번째 항목이 있으면 그것을 선택, 없으면 입력한 값 검증
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
    if (!selectedFile) {
      alert("파일을 선택해주세요.");
      return;
    }
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

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      setIsUploading(false);
      return;
    }
    const loggedInUser = JSON.parse(storedUser);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);
      formData.append("content", content);
      formData.append("price", parseInt(price));
      formData.append("userNum", loggedInUser.userNum);
      formData.append("tags", JSON.stringify(tags));

      console.log("=== 업로드 시작 ===");
      console.log("파일:", selectedFile.name);
      console.log("크기:", formatFileSize(selectedFile.size));

      const response = await axios.post("/api/boardlookup/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      console.log("=== 업로드 응답 ===");
      console.log(response.data);

      if (response.data.success) {
        alert("게시글이 등록되었습니다!");
        navigate("/");
      } else {
        alert("게시글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 등록 오류:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("게시글 등록 중 오류가 발생했습니다: " + errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="board-lookup-write-page">
      <header className="page-header">
        <h1 className="page-title">게시물 작성</h1>
      </header>

      <div className="page-container">
        <div className="content-grid">
          <div className="upload-section">
            <div className="image-upload-area">
              {!selectedFile ? (
                <div className="upload-placeholder">
                  <Upload className="upload-icon" />
                  <p className="upload-text">파일 업로드 (PDF)</p>
                  <label className="file-select-button">
                    파일 선택
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                  </label>
                </div>
              ) : (
                <div className="pdf-preview">
                  <div className="pdf-icon-container">
                    <FileText size={80} color="#ef4444" />
                  </div>
                  <div className="pdf-info">
                    <div className="pdf-success">
                      <CheckCircle size={20} color="#10b981" />
                      <span>PDF 업로드 완료</span>
                    </div>
                    <p className="pdf-filename">{selectedFile.name}</p>
                    <p className="pdf-filesize">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <p className="pdf-hint">
                      등록 후 자동으로 이미지로 변환됩니다
                    </p>

                    <button
                      onClick={handleGenerateAiSummary}
                      disabled={isAnalyzing}
                      className="ai-analyze-button"
                      style={{
                        marginTop: "15px",
                        padding: "10px 20px",
                        backgroundColor: isAnalyzing ? "#ccc" : "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isAnalyzing ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      <Sparkles size={18} />
                      {isAnalyzing ? "AI 분석 중..." : "AI 요약 생성"}
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="remove-image-button"
                  >
                    <X className="remove-icon" />
                  </button>
                </div>
              )}
            </div>
            <div className="feature-description">
              <p>• PDF 업로드 후 자동으로 페이지별 이미지 변환</p>
              <p>• AI가 PDF 내용을 분석하여 '내용'에 요약 제공</p>
              <p>• 태그를 추가하여 검색 최적화</p>
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
                onChange={handlePriceChange} // ✅ 여기 수정
                className="form-input"
                placeholder="가격을 입력하세요 (100원 단위)"
                min="0"
                step="100"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || !title || !price || isUploading}
              className="submit-button"
            >
              {isUploading ? "업로드 중..." : "게시글 등록"}
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
