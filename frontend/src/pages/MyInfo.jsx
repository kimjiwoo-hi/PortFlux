import { useState, useEffect } from "react";
import axios from "axios";
import "./MyInfo.css";
import UserDefaultIcon from "../assets/user_default_icon.png";

const MyInfo = () => {
  const [userInfo, setUserInfo] = useState({
    userId: "",
    userName: "",
    userNickname: "",
    userEmail: "",
    userPhone: "",
    userCreateAt: "",
    userLevel: 0,
    userImage: "",
    userBanner: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 이미지 미리보기
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // 비밀번호 변경 모달
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserInfo = async () => {
    try {
      // localStorage 또는 sessionStorage에서 user 객체 가져오기
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (!storedUser) {
        setError("로그인 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user.userId) {
        console.error("userId가 없습니다. 다시 로그인해주세요.");
        setError("로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await axios.get(
        `/api/user/info/${user.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      setUserInfo(response.data);
      setEditedInfo(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("사용자 정보를 불러오는데 실패했습니다.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(userInfo);
    setError("");
  };

  const handleSave = async () => {
    try {
      // 기본 이미지인 경우 빈 문자열로 변환하여 서버에 전송
      const dataToSave = {
        ...editedInfo,
        userImage:
          editedInfo.userImage === UserDefaultIcon ? "" : editedInfo.userImage,
        userBanner:
          editedInfo.userBanner === getDefaultBanner()
            ? ""
            : editedInfo.userBanner,
      };

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `/api/user/info/${userInfo.userId}`,
        dataToSave,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      setUserInfo(editedInfo);
      setIsEditing(false);
      setSuccessMessage("정보가 성공적으로 수정되었습니다.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "정보 수정에 실패했습니다.");
    }
  };

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
        `/api/user/info/${userInfo.userId}/password`,
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

  // 기본 배너 이미지 (SVG 그라데이션)
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

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="myinfo-container">
      <div className="myinfo-header">
        <h1>내 정보</h1>
        {!isEditing && (
          <button className="btn-edit" onClick={handleEdit}>
            수정하기
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="info-section">
        {/* 이미지 섹션 */}
        <div className="image-section">
          {/* 배너 이미지 */}
          <div className="banner-container">
            <img
              src={
                bannerPreview
                  ? bannerPreview
                  : editedInfo.userBanner && editedInfo.userBanner.trim() !== ""
                  ? editedInfo.userBanner
                  : userInfo.userBanner && userInfo.userBanner.trim() !== ""
                  ? userInfo.userBanner
                  : getDefaultBanner()
              }
              alt="배너"
              className="banner-image"
            />
            {isEditing && (
              <>
                <label className="image-upload-label banner-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                    style={{ display: "none" }}
                  />
                  배너 변경
                </label>
                {(bannerPreview ||
                  (editedInfo.userBanner &&
                    editedInfo.userBanner.trim() !== "")) && (
                  <button
                    className="image-delete-btn banner-delete"
                    onClick={handleBannerImageDelete}
                  >
                    배너 삭제
                  </button>
                )}
              </>
            )}
          </div>

          {/* 프로필 이미지 */}
          <div className="myinfo-profile-container">
            <img
              src={
                profilePreview
                  ? profilePreview
                  : editedInfo.userImage && editedInfo.userImage.trim() !== ""
                  ? editedInfo.userImage
                  : userInfo.userImage && userInfo.userImage.trim() !== ""
                  ? userInfo.userImage
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
                  프로필 변경
                </label>
                {(profilePreview ||
                  (editedInfo.userImage &&
                    editedInfo.userImage.trim() !== "")) && (
                  <button
                    className="image-delete-btn profile-delete"
                    onClick={handleProfileImageDelete}
                  >
                    프로필 삭제
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="info-grid">
          {/* 아이디 (수정 불가) */}
          <div className="info-item">
            <label>아이디</label>
            <input
              type="text"
              value={userInfo.userId}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 이름 (수정 불가) */}
          <div className="info-item">
            <label>이름</label>
            <input
              type="text"
              name="userName"
              value={userInfo.userName}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 닉네임 (수정 가능) */}
          <div className="info-item">
            <label>닉네임</label>
            <input
              type="text"
              name="userNickname"
              value={
                isEditing ? editedInfo.userNickname : userInfo.userNickname
              }
              onChange={handleChange}
              disabled={!isEditing}
              className={isEditing ? "input-editable" : "input-disabled"}
            />
          </div>

          {/* 이메일 (수정 불가) */}
          <div className="info-item">
            <label>이메일</label>
            <input
              type="email"
              name="userEmail"
              value={userInfo.userEmail}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 휴대폰 (수정 불가) */}
          <div className="info-item">
            <label>휴대폰</label>
            <input
              type="tel"
              name="userPhone"
              value={userInfo.userPhone}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 가입일 (수정 불가) */}
          <div className="info-item">
            <label>가입일</label>
            <input
              type="text"
              value={formatDate(userInfo.userCreateAt)}
              disabled
              className="input-disabled"
            />
          </div>

          {/* 회원 등급 (수정 불가)
          레벨 기능은 삭제
          <div className="info-item">
            <label>회원 등급</label>
            <input
              type="text"
              value={`Level ${userInfo.userLevel || 1}`}
              disabled
              className="input-disabled"
            />
          </div>
          */}
        </div>

        {/* 수정 모드 버튼 */}
        {isEditing && (
          <div className="button-group">
            <button className="btn-cancel" onClick={handleCancel}>
              취소
            </button>
            <button className="btn-save" onClick={handleSave}>
              저장
            </button>
          </div>
        )}

        {/* 비밀번호 변경 버튼 */}
        {!isEditing && (
          <div className="password-section">
            <button
              className="btn-password"
              onClick={() => setShowPasswordModal(true)}
            >
              비밀번호 변경
            </button>
          </div>
        )}
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

export default MyInfo;
