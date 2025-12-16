import React, { useState, useMemo } from 'react';
import { Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BoardLookupWritePage.css';
import { tagData } from '../database/taglist.js';

export default function BoardLookupWritePage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  const allTags = useMemo(() => {
    return Object.values(tagData).flat();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { 
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.trim()) {
      const filteredSuggestions = allTags.filter(
        (tag) => tag.toLowerCase().includes(value.toLowerCase()) && !tags.includes(tag)
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
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
    // 유효성 검사
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    if (!price || price <= 0) {
      alert('가격을 입력해주세요.');
      return;
    }

    setIsUploading(true);

    try {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('price', parseInt(price)); // 숫자로 변환
    formData.append('userNum', 1); // 현재 하드코딩된 값

    // 핵심: 태그 리스트를 JSON 문자열로 변환하여 하나의 문자열로 보냄
    // DB의 tags 컬럼이 VARCHAR2(2000)이므로 이 방식이 매퍼와 가장 잘 맞습니다.
    formData.append('tags', JSON.stringify(tags)); 

    const response = await axios.post(
      'http://localhost:8080/api/boardlookup/posts',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      }
    );

      if (response.data.success) {
        alert('게시글이 등록되었습니다!');
        navigate('/');
      } else {
        alert('게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 등록 오류:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('게시글 등록 중 오류가 발생했습니다: ' + errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
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
              {!selectedImage ? (
                <div className="upload-placeholder">
                  <Upload className="upload-icon" />
                  <p className="upload-text">파일 업로드 (PDF, PPT, 이미지 등)</p>
                  <label className="file-select-button">
                    파일 선택
                    <input type="file" accept="*/*" onChange={handleImageUpload} className="file-input" />
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={selectedImage} alt="업로드된 파일 미리보기" className="preview-image" />
                  <button onClick={() => { setSelectedImage(null); setSelectedFile(null); }} className="remove-image-button">
                    <X className="remove-icon" />
                  </button>
                </div>
              )}
            </div>
            <div className="feature-description">
              <p>• 파일 업로드 후 게시글을 작성하세요</p>
              <p>• PDF, PPT, 이미지 파일 지원</p>
              <p>• 태그를 추가하여 검색 최적화</p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="제목을 입력하세요" />
            </div>

            <div className="form-group">
              <label className="form-label">내용</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="form-input" placeholder="내용을 입력하세요" rows="5" style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">태그 추가</label>
              <div className="tag-input-wrapper">
                <input type="text" value={tagInput} onChange={handleTagInputChange} onKeyPress={handleAddTagOnEnter} className="form-input" placeholder="태그 입력 후 Enter 또는 아래에서 선택" />
                {suggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => addTag(suggestion)}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="tag-remove"><X className="tag-remove-icon" /></button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">가격 (₩)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-input" placeholder="가격을 입력하세요" min="0" />
            </div>

            <button onClick={handleSubmit} disabled={!selectedFile || !title || !price || isUploading} className="submit-button">
              {isUploading ? '업로드 중...' : '게시글 등록'}
            </button>
          </div>
        </div>
        
        <div className="full-tag-list-container">
          {Object.entries(tagData).map(([category, tagList]) => (
            <div key={category} className="tag-category-section">
              <h3 className="tag-category-title">{category}</h3>
              <div className="clickable-tags-list">
                {(expandedCategories[category] ? tagList : tagList.slice(0, 10)).map(tag => (
                  !tags.includes(tag) && (
                    <button key={tag} onClick={() => addTag(tag)} className="clickable-tag">{tag}</button>
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