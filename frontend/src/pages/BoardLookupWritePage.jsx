import React, { useState, useMemo } from 'react';
import { Upload, X } from 'lucide-react';
import './BoardLookupWritePage.css';
import { tagData } from '../database/taglist.js'; // tagData import 추가

// 모든 태그를 하나의 배열로 만듭니다 (자동완성용)
const allTags = Object.values(tagData).flat();

export default function BoardLookupWritePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // 자동완성 추천 태그 목록 상태
  const [suggestions, setSuggestions] = useState([]);
  // 카테고리 펼침 상태
  const [expandedCategories, setExpandedCategories] = useState({});

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 태그 입력창 변경 핸들러 (자동완성 기능 추가)
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.trim()) {
      const filteredSuggestions = allTags.filter(
        (tag) => tag.toLowerCase().includes(value.toLowerCase()) && !tags.includes(tag)
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // 최대 5개 추천
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagToAdd) => {
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
    }
    setTagInput('');
    setSuggestions([]);
  };

  const handleAddTagOnEnter = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    // 여기에 API 호출 로직 추가
    setTimeout(() => {
      setIsUploading(false);
      alert('판매글이 등록되었습니다!');
      // 초기화
      setSelectedImage(null);
      setTitle('');
      setTags([]);
      setPrice('');
    }, 1500);
  };

  // 카테고리 펼침/접기 토글 핸들러
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="board-lookup-write-page">
      {/* 헤더 */}
      <header className="page-header">
        <h1 className="page-title">작성 페이지</h1>
      </header>

      <div className="page-container">
        <div className="content-grid">
          {/* 왼쪽: 이미지 업로드 영역 */}
          <div className="upload-section">
            <div className="image-upload-area">
              {!selectedImage ? (
                <div className="upload-placeholder">
                  <Upload className="upload-icon" />
                  <p className="upload-text">판매 업로드</p>
                  <label className="file-select-button">
                    파일 선택
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img
                    src={selectedImage}
                    alt="업로드된 이미지"
                    className="preview-image"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="remove-image-button"
                  >
                    <X className="remove-icon" />
                  </button>
                </div>
              )}
            </div>

            {/* 옵션 설명 */}
            <div className="feature-description">
              <p>요약 서를 이용한</p>
              <p>pdf설명글 초안설명를 자동으로 작성</p>
              <p>해준과 작성자가</p>
              <p>수정할 수 있도록</p>
              <p>진행될 예정</p>
            </div>
          </div>

          {/* 오른쪽: 입력 폼 */}
          <div className="form-section">
            {/* 제목 */}
            <div className="form-group">
              <label className="form-label">제목 :</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="제목을 입력하세요"
              />
            </div>

            {/* 태그 섹션 */}
            <div className="form-group">
              <label className="form-label">태그 삽입</label>
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleAddTagOnEnter}
                  className="form-input"
                  placeholder="태그 입력 후 Enter 또는 아래에서 선택"
                />
                {/* 자동완성 제안 목록 */}
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
            
            {/* 가격 설정 */}
            <div className="form-group">
              <label className="form-label">가격 설정</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
                placeholder="가격을 입력하세요"
              />
            </div>

            {/* 업로드 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || !title || !price || isUploading}
              className="submit-button"
            >
              {isUploading ? '업로드 중...' : '판매 등록'}
            </button>
          </div>
        </div>
        
        {/* 전체 태그 목록 섹션 */}
        <div className="full-tag-list-container">
          {Object.entries(tagData).map(([category, tagList]) => (
            <div key={category} className="tag-category-section">
              <h3 className="tag-category-title">{category}</h3>
              <div className="clickable-tags-list">
                {(expandedCategories[category] ? tagList : tagList.slice(0, 10)).map(tag => (
                  !tags.includes(tag) && (
                    <button key={tag} onClick={() => addTag(tag)} className="clickable-tag">
                      {tag}
                    </button>
                  )
                ))}
              </div>
              {tagList.length > 10 && (
                <button onClick={() => toggleCategory(category)} className="toggle-tags-button">
                  {expandedCategories[category] ? '접기' : '더 보기'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
