import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";
import UserDefaultIcon from "../assets/user_default_icon.png";
import { updateUserInfoCache } from "../utils/userInfoCache";

const UserProfile = () => {
  const { userNum, nickname } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [userInfo, setUserInfo] = useState(null);
  const [fullUserInfo, setFullUserInfo] = useState(null); // 본인일 때 전체 정보
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // 비밀번호 변경 모달
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 본인 여부 확인
  const checkIsOwner = useCallback(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) return false;

    const user = JSON.parse(storedUser);
    const currentUserNickname = user.userNickname || localStorage.getItem("userNickname") || sessionStorage.getItem("userNickname");

    if (nickname) {
      return currentUserNickname === nickname;
    } else if (userNum) {
      return String(user.userNum) === String(userNum);
    }
    return false;
  }, [nickname, userNum]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const owner = checkIsOwner();
        setIsOwner(owner);

        // 본인인 경우 전체 정보 API 호출
        if (owner) {
          const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
          const user = JSON.parse(storedUser);
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");

          const fullInfoResponse = await axios.get(
            `/api/user/info/${user.userId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );

          setFullUserInfo(fullInfoResponse.data);
          setEditedInfo(fullInfoResponse.data);

          setUserInfo({
            userNum: fullInfoResponse.data.userNum,
            userNickname: fullInfoResponse.data.userNickname,
            userImage: fullInfoResponse.data.userImage,
            userBanner: fullInfoResponse.data.userBanner
          });
        }

        // nickname 또는 userNum으로 조회
        const identifier = nickname || userNum;
        const endpoint = nickname ? 'nickname' : 'userNum';

        const [postsResponse, commentsResponse] = await Promise.all([
          axios.get(`/api/boardlookup/user/${endpoint}/${identifier}/posts`),
          axios.get(`/api/boardlookup/user/${endpoint}/${identifier}/comments`)
        ]);

        setPosts(postsResponse.data);
        setComments(commentsResponse.data);

        // 본인이 아닌 경우 게시글/댓글에서 사용자 정보 추출
        if (!owner) {
          if (postsResponse.data.length > 0) {
            const firstPost = postsResponse.data[0];
            setUserInfo({
              userNum: firstPost.userNum,
              userNickname: firstPost.userNickname,
              userImage: firstPost.userImageBase64,
              userBanner: firstPost.userBannerBase64 ? `data:image/jpeg;base64,${firstPost.userBannerBase64}` : null,
            });
          } else if (commentsResponse.data.length > 0) {
            const firstComment = commentsResponse.data[0];
            setUserInfo({
              userNum: firstComment.userNum,
              userNickname: firstComment.userNickname,
              userImage: firstComment.userImageBase64,
              userBanner: firstComment.userBannerBase64 ? `data:image/jpeg;base64,${firstComment.userBannerBase64}` : null,
            });
          } else {
            setUserInfo({
              userNum: userNum,
              userNickname: identifier,
              userImage: null,
              userBanner: null,
            });
          }
        }

        // 본인인 경우 저장한 게시글 조회
        if (owner) {
          try {
            const savedResponse = await axios.get('/api/post-save/my-saved-posts', {
              withCredentials: true
            });
            setSavedPosts(savedResponse.data);
          } catch (err) {
            console.error("저장한 게시글 조회 실패:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("사용자 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    if (userNum || nickname) {
      fetchUserProfile();
    }
  }, [userNum, nickname, checkIsOwner]);

  const handlePostClick = (postId, boardType) => {
    if (boardType === 'free') {
      navigate(`/boardfree/${postId}`);
    } else if (boardType === 'lookup') {
      navigate(`/board/lookup/${postId}`);
    } else if (boardType === 'job') {
      navigate(`/boardjob/${postId}`);
    } else {
      navigate(`/board/lookup/${postId}`);
    }
  };

  const getBoardTypeName = (boardType) => {
    switch(boardType) {
      case 'lookup': return '둘러보기';
      case 'free': return '커뮤니티';
      case 'job': return '채용';
      default: return boardType;
    }
  };

  const getDefaultBanner = () => {
    const svg = `
      <svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="300" fill="url(#grad)" />
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // 편집 모드 시작
  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccessMessage("");
  };

  // 편집 취소
  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(fullUserInfo);
    setProfilePreview(null);
    setBannerPreview(null);
    setError("");
  };

  // 저장
  const handleSave = async () => {
    try {
      const dataToSave = {
        ...editedInfo,
        userImage: editedInfo.userImage === UserDefaultIcon ? "" : editedInfo.userImage,
        userBanner: editedInfo.userBanner === getDefaultBanner() ? "" : editedInfo.userBanner,
      };

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `/api/user/info/${fullUserInfo.userId}`,
        dataToSave,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setFullUserInfo(editedInfo);
      setUserInfo({
        userNum: editedInfo.userNum,
        userNickname: editedInfo.userNickname,
        userImage: editedInfo.userImage,
        userBanner: editedInfo.userBanner
      });

      // 캐시 업데이트
      updateUserInfoCache({
        userName: editedInfo.userName,
        userNickname: editedInfo.userNickname,
        userEmail: editedInfo.userEmail,
        userImage: editedInfo.userImage,
        userBanner: editedInfo.userBanner
      });

      setIsEditing(false);
      setProfilePreview(null);
      setBannerPreview(null);
      setSuccessMessage("정보가 성공적으로 수정되었습니다.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "정보 수정에 실패했습니다.");
    }
  };

  // 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo({
      ...editedInfo,
      [name]: value,
    });
  };

  // 프로필 이미지 변경
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
        setEditedInfo({
          ...editedInfo,
          userImage: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 이미지 삭제
  const handleProfileImageDelete = () => {
    setProfilePreview(UserDefaultIcon);
    setEditedInfo((prev) => ({
      ...prev,
      userImage: UserDefaultIcon,
    }));
  };

  // 배너 이미지 변경
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
        setEditedInfo({
          ...editedInfo,
          userBanner: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 배너 이미지 삭제
  const handleBannerImageDelete = () => {
    const defaultBanner = getDefaultBanner();
    setBannerPreview(defaultBanner);
    setEditedInfo((prev) => ({
      ...prev,
      userBanner: defaultBanner,
    }));
  };

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `/api/user/info/${fullUserInfo.userId}/password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setShowPasswordModal(false);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "비밀번호 변경에 실패했습니다.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="myinfo-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="myinfo-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="myinfo-container">
      <div className="myinfo-content">
        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        {/* 배너 이미지 */}
        <div className="banner-container">
          <img
            src={
              bannerPreview
                ? bannerPreview
                : isEditing && editedInfo.userBanner && editedInfo.userBanner.trim() !== ""
                ? editedInfo.userBanner
                : userInfo?.userBanner && userInfo.userBanner.trim() !== ""
                ? userInfo.userBanner
                : getDefaultBanner()
            }
            alt="배너"
            className="banner-image"
          />
          {isEditing && (
            <>
              <label className="banner-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageChange}
                  style={{ display: "none" }}
                />
                배너 변경
              </label>
              {(bannerPreview || (editedInfo.userBanner && editedInfo.userBanner.trim() !== "")) && (
                <button
                  className="banner-delete"
                  onClick={handleBannerImageDelete}
                >
                  배너 삭제
                </button>
              )}
            </>
          )}
        </div>

        {/* 프로필 이미지 & 닉네임 */}
        <div className="profile-header">
          <div className="myinfo-profile-container">
            <img
              src={
                profilePreview
                  ? profilePreview
                  : isEditing && editedInfo.userImage && editedInfo.userImage.trim() !== ""
                  ? editedInfo.userImage
                  : userInfo?.userImage && userInfo.userImage.trim() !== ""
                  ? (userInfo.userImage.startsWith('data:') ? userInfo.userImage : `data:image/jpeg;base64,${userInfo.userImage}`)
                  : UserDefaultIcon
              }
              alt="프로필"
              className="myinfo-profile-image"
            />
            {isEditing && (
              <>
                <label className="image-upload-label myinfo-profile-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                {(profilePreview || (editedInfo.userImage && editedInfo.userImage.trim() !== "")) && (
                  <button
                    className="image-delete-btn profile-delete"
                    onClick={handleProfileImageDelete}
                  />
                )}
              </>
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-nickname">{userInfo?.userNickname}</h2>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            작성한 게시글 ({posts.length})
          </button>
          <button
            className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            작성한 댓글 ({comments.length})
          </button>
          {isOwner && (
            <>
              <button
                className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
                onClick={() => setActiveTab("saved")}
              >
                저장한 게시글 ({savedPosts.length})
              </button>
              <button
                className={`tab-button ${activeTab === "myinfo" ? "active" : ""}`}
                onClick={() => setActiveTab("myinfo")}
              >
                내 정보
              </button>
            </>
          )}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === "posts" && (
            <div className="posts-list">
              {posts.length === 0 ? (
                <p className="empty-message">작성한 게시글이 없습니다.</p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.postId}
                    className="post-item"
                    onClick={() => handlePostClick(post.postId, post.boardType)}
                  >
                    <div className="post-info-row">
                      <h3 className="post-title">{post.title}</h3>
                    </div>
                    <div className="post-bottom-row">
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="post-meta">
                        <span>조회 {post.viewCnt}</span>
                        {post.price && <span className="post-price">{post.price.toLocaleString()}원</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="empty-message">작성한 댓글이 없습니다.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.commentId}
                    className="comment-item"
                    onClick={() => handlePostClick(comment.postId, comment.boardType)}
                  >
                    <div className="comment-post-info">
                      <span className="post-badge">{getBoardTypeName(comment.boardType)}</span>
                      <span className="comment-post-title">{comment.postTitle}</span>
                    </div>
                    <p className="comment-content">{comment.commentContent}</p>
                    <span className="comment-date">
                      {new Date(comment.commentCreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "myinfo" && isOwner && fullUserInfo && (
            <div className="info-section">
              <div className="info-grid">
                <div className="info-item">
                  <label>아이디</label>
                  <input
                    type="text"
                    value={fullUserInfo.userId}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="info-item">
                  <label>이름</label>
                  <input
                    type="text"
                    value={fullUserInfo.userName}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="info-item">
                  <label>닉네임</label>
                  <input
                    type="text"
                    name="userNickname"
                    value={isEditing ? editedInfo.userNickname : fullUserInfo.userNickname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={isEditing ? "input-editable" : "input-disabled"}
                  />
                </div>

                <div className="info-item">
                  <label>이메일</label>
                  <input
                    type="email"
                    value={fullUserInfo.userEmail}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="info-item">
                  <label>휴대폰</label>
                  <input
                    type="tel"
                    value={fullUserInfo.userPhone}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="info-item">
                  <label>가입일</label>
                  <input
                    type="text"
                    value={formatDate(fullUserInfo.userCreateAt)}
                    disabled
                    className="input-disabled"
                  />
                </div>
              </div>

              {isEditing ? (
                <div className="button-group">
                  <button className="btn-cancel" onClick={handleCancel}>
                    취소
                  </button>
                  <button className="btn-save" onClick={handleSave}>
                    저장
                  </button>
                </div>
              ) : (
                <div className="button-group">
                  <button
                    className="btn-password"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    비밀번호 변경
                  </button>
                  <button className="btn-edit" onClick={handleEdit}>
                    내 정보 수정
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && isOwner && (
            <div className="posts-list">
              {savedPosts.length === 0 ? (
                <p className="empty-message">저장한 게시글이 없습니다.</p>
              ) : (
                savedPosts.map((post) => (
                  <div
                    key={post.postId}
                    className="post-item"
                    onClick={() => handlePostClick(post.postId, 'lookup')}
                  >
                    <div className="post-info-row">
                      <h3 className="post-title">{post.title}</h3>
                    </div>
                    <div className="post-bottom-row">
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="post-meta">
                        <span>조회 {post.viewCnt}</span>
                        {post.price && <span className="post-price">{post.price.toLocaleString()}원</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>비밀번호 변경</h2>
            <div className="modal-body">
              <div className="info-item">
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div className="info-item">
                <label>새 비밀번호</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
              <div className="info-item">
                <label>새 비밀번호 확인</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setError("");
                }}
              >
                취소
              </button>
              <button className="btn-save" onClick={handlePasswordChange}>
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
