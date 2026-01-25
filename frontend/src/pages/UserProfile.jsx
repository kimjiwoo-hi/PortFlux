import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";
import UserDefaultIcon from "../assets/user_default_icon.png";
import { updateUserInfoCache } from "../utils/userInfoCache";
import { follow, unfollow, isFollowing as checkFollowing, getFollowers, getFollowing } from "../api/api";
import FollowListPopover from "../components/FollowListPopover";

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
  const [isCompany, setIsCompany] = useState(false); // 기업 회원 여부

  // 팔로우 관련 상태
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // 닉네임 중복 검사
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState(""); // "available", "duplicate", "checking", ""
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // 비밀번호 변경 모달
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 팔로우 리스트 팝오버
  const [showFollowPopover, setShowFollowPopover] = useState(false);
  const [followPopoverTab, setFollowPopoverTab] = useState('followers');
  const followersRef = useRef(null);
  const followingRef = useRef(null);

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

        let currentUserInfo = null;
        let companyUser = false;

        // 본인인 경우 전체 정보 API 호출
        if (owner) {
          const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
          const user = JSON.parse(storedUser);
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const memberType = localStorage.getItem("memberType") || sessionStorage.getItem("memberType");
          companyUser = memberType === "company";
          setIsCompany(companyUser);

          let fullInfoResponse;
          if (companyUser) {
            // 기업 회원
            fullInfoResponse = await axios.get(
              `/api/company/info/${user.userId || user.companyId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                withCredentials: true
              }
            );

            const companyData = fullInfoResponse.data;
            const normalizedData = {
              userId: companyData.companyId,
              userName: companyData.companyName,
              userNickname: companyData.companyName,
              userEmail: companyData.companyEmail,
              userPhone: companyData.companyPhone,
              userNum: companyData.companyNum,
              userImage: companyData.companyImage,
              userBanner: companyData.companyBanner,
              userCreateAt: companyData.companyCreateAt,
              businessNumber: companyData.businessNumber,
              isCompany: true
            };
            setFullUserInfo(normalizedData);
            setEditedInfo(normalizedData);

            currentUserInfo = {
              userNum: companyData.companyNum,
              userNickname: companyData.companyName,
              userImage: companyData.companyImage,
              userBanner: companyData.companyBanner
            };
          } else {
            // 일반 회원
            fullInfoResponse = await axios.get(
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

            currentUserInfo = {
              userNum: fullInfoResponse.data.userNum || user.userNum,
              userNickname: fullInfoResponse.data.userNickname,
              userImage: fullInfoResponse.data.userImage,
              userBanner: fullInfoResponse.data.userBanner
            };
          }
          setUserInfo(currentUserInfo);
        }

        // nickname 또는 userNum으로 조회
        const identifier = nickname || userNum;
        const endpoint = nickname ? 'nickname' : 'userNum';

        const [postsResponse, commentsResponse] = await Promise.all([
          axios.get(`/api/boardlookup/user/${endpoint}/${identifier}/posts`),
          axios.get(`/api/boardlookup/user/${endpoint}/${identifier}/comments`)
        ]);

        // boardlookup에서 가져온 게시글 (채용공고 제외)
        let allPosts = (postsResponse.data || []).filter(post => post.boardType !== 'job');

        // 기업 회원인 경우 작성한 채용공고도 조회
        if (owner && companyUser) {
          try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const jobPostsResponse = await axios.get(
              `http://localhost:8080/api/jobs/my?page=0&size=100`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true
              }
            );
            const jobPosts = (jobPostsResponse.data.content || []).map(job => ({
              ...job,
              boardType: 'job'  // boardType 명시적으로 추가
            }));
            allPosts = [...allPosts, ...jobPosts];

            // 날짜순 정렬 (최신순)
            allPosts.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.created_at);
              const dateB = new Date(b.createdAt || b.created_at);
              return dateB - dateA;
            });
          } catch (err) {
            console.error("채용공고 조회 실패:", err);
          }
        }

        setPosts(allPosts);
        setComments(commentsResponse.data);

        // 본인이 아닌 경우 게시글/댓글에서 사용자 정보 추출
        if (!owner) {
          if (postsResponse.data.length > 0) {
            const firstPost = postsResponse.data[0];
            currentUserInfo = {
              userNum: firstPost.userNum,
              userNickname: firstPost.userNickname,
              userImage: firstPost.userImageBase64,
              userBanner: firstPost.userBannerBase64 ? `data:image/jpeg;base64,${firstPost.userBannerBase64}` : null,
            };
            setUserInfo(currentUserInfo);
          } else if (commentsResponse.data.length > 0) {
            const firstComment = commentsResponse.data[0];
            currentUserInfo = {
              userNum: firstComment.userNum,
              userNickname: firstComment.userNickname,
              userImage: firstComment.userImageBase64,
              userBanner: firstComment.userBannerBase64 ? `data:image/jpeg;base64,${firstComment.userBannerBase64}` : null,
            };
            setUserInfo(currentUserInfo);
          } else {
            currentUserInfo = {
              userNum: userNum,
              userNickname: identifier,
              userImage: null,
              userBanner: null,
            };
            setUserInfo(currentUserInfo);
          }
        }

        // 본인인 경우 저장한 게시글 조회
        if (owner) {
          try {
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            const user = JSON.parse(storedUser);
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            // 1. boardlookup 저장한 게시글 조회
            const savedIdsResponse = await axios.get(
              `/api/boardlookup/user/${user.userNum}/saved`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true
              }
            );

            // 2. 채용공고 북마크 조회
            let jobBookmarks = [];
            try {
              const jobBookmarksResponse = await axios.get(
                `http://localhost:8080/api/jobs/bookmarks?page=0&size=100`,
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                  withCredentials: true
                }
              );
              jobBookmarks = (jobBookmarksResponse.data.content || []).map(job => ({
                ...job,
                boardType: 'job'  // boardType 명시적으로 추가
              }));
            } catch (err) {
              console.error("채용공고 북마크 조회 실패:", err);
            }

            let allSavedPosts = [];

            // boardlookup 게시글 상세 정보 가져오기
            if (savedIdsResponse.data && savedIdsResponse.data.length > 0) {
              const postDetailsPromises = savedIdsResponse.data.map((postId) =>
                axios.get(`/api/boardlookup/${postId}`, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                  withCredentials: true,
                }).catch(err => {
                  console.error(`게시글 ${postId} 조회 실패:`, err);
                  return null;
                })
              );

              const postDetailsResponses = await Promise.all(postDetailsPromises);
              const posts = postDetailsResponses
                .filter(res => res !== null)
                .map((res) => res.data.post || res.data);
              allSavedPosts = [...posts];
            }

            // 채용공고 북마크 추가
            if (jobBookmarks.length > 0) {
              allSavedPosts = [...allSavedPosts, ...jobBookmarks];
            }

            // 날짜순 정렬 (최신순)
            allSavedPosts.sort((a, b) => {
              const dateA = new Date(a.createdAt || a.created_at);
              const dateB = new Date(b.createdAt || b.created_at);
              return dateB - dateA;
            });

            setSavedPosts(allSavedPosts);
          } catch (err) {
            console.error("저장한 게시글 조회 실패:", err);
            setSavedPosts([]);
          }
        }

        // 팔로우 정보 조회
        if (currentUserInfo?.userNum) {
          await loadFollowInfo(currentUserInfo.userNum, !owner);
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

  // 팔로우 정보 로드
  const loadFollowInfo = async (targetUserNum, checkIsFollowing) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(targetUserNum),
        getFollowing(targetUserNum)
      ]);

      setFollowersCount(followersRes.data.count || 0);
      setFollowingCount(followingRes.data.count || 0);

      // 다른 사용자의 프로필인 경우 팔로우 여부 확인
      if (checkIsFollowing) {
        const followingStatus = await checkFollowing(targetUserNum);
        setIsFollowingUser(followingStatus.data.following);
      }
    } catch (error) {
      console.error("팔로우 정보 조회 실패:", error);
      setFollowersCount(0);
      setFollowingCount(0);
      setIsFollowingUser(false);
    }
  };

  // 팔로우/언팔로우 토글
  const handleFollowToggle = async () => {
    if (!userInfo?.userNum) return;

    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await unfollow(userInfo.userNum);
        setIsFollowingUser(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await follow(userInfo.userNum);
        setIsFollowingUser(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("팔로우 토글 실패:", error);
      // 에러 발생 시 상태 롤백
      await loadFollowInfo(userInfo.userNum, !isOwner);
    } finally {
      setFollowLoading(false);
    }
  };

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
    setNicknameCheckStatus("");
    setIsNicknameChecked(false);
  };

  // 편집 취소
  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(fullUserInfo);
    setProfilePreview(null);
    setBannerPreview(null);
    setError("");
    setNicknameCheckStatus("");
    setIsNicknameChecked(false);
  };

  // 닉네임 중복 검사
  const handleCheckNickname = async () => {
    if (!editedInfo.userNickname || editedInfo.userNickname.trim() === "") {
      setNicknameCheckStatus("duplicate");
      setIsNicknameChecked(false);
      return;
    }

    // 닉네임이 변경되지 않았으면 검사할 필요 없음
    if (editedInfo.userNickname === fullUserInfo.userNickname) {
      setNicknameCheckStatus("available");
      setIsNicknameChecked(true);
      return;
    }

    try {
      setNicknameCheckStatus("checking");
      const response = await axios.post(
        '/api/user/register/check-nickname',
        { nickname: editedInfo.userNickname },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // response.data가 true면 사용 가능 (중복 아님)
      if (response.data === true) {
        setNicknameCheckStatus("available");
        setIsNicknameChecked(true);
      } else {
        setNicknameCheckStatus("duplicate");
        setIsNicknameChecked(false);
      }
    } catch (err) {
      console.error("닉네임 중복 검사 실패:", err);
      setNicknameCheckStatus("duplicate");
      setIsNicknameChecked(false);
    }
  };

  // 저장
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (isCompany) {
        // 기업 회원 정보 저장 (기업명은 변경 불가능하므로 기존 값 사용)
        const dataToSave = {
          companyName: fullUserInfo.userName,
          companyPhone: editedInfo.userPhone,
          companyImage: editedInfo.userImage === "" ? "" : editedInfo.userImage,
          companyBanner: editedInfo.userBanner === "" ? "" : editedInfo.userBanner,
        };

        await axios.put(
          `/api/company/info/${fullUserInfo.userId}`,
          dataToSave,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );

        // user 객체 업데이트 (이미지만)
        const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
        const storedUser = storage.getItem("user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.userImage = editedInfo.userImage;
            user.userBanner = editedInfo.userBanner;
            storage.setItem("user", JSON.stringify(user));
          } catch (e) {
            console.error("user 객체 업데이트 실패:", e);
          }
        }
      } else {
        // 닉네임이 변경되었는지 확인
        const nicknameChanged = editedInfo.userNickname !== fullUserInfo.userNickname;

        // 닉네임이 변경되었다면 중복 체크 확인
        if (nicknameChanged && !isNicknameChecked) {
          setError("닉네임 중복 확인을 해주세요.");
          setTimeout(() => setError(""), 3000);
          return;
        }

        // 일반 회원 정보 저장
        const dataToSave = {
          ...editedInfo,
          userImage: editedInfo.userImage === "" ? "" : editedInfo.userImage,
          userBanner: editedInfo.userBanner === "" ? "" : editedInfo.userBanner,
        };

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

        // localStorage/sessionStorage 업데이트 (닉네임, 이미지)
        const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
        if (nicknameChanged && storage.getItem("userNickname")) {
          storage.setItem("userNickname", editedInfo.userNickname);
        }

        // user 객체도 업데이트
        const storedUser = storage.getItem("user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.userNickname = editedInfo.userNickname;
            user.userImage = editedInfo.userImage;
            user.userBanner = editedInfo.userBanner;
            storage.setItem("user", JSON.stringify(user));
          } catch (e) {
            console.error("user 객체 업데이트 실패:", e);
          }
        }
      }

      // 저장된 데이터로 상태 업데이트 (빈 문자열은 그대로 유지)
      const updatedInfo = {
        ...editedInfo,
        userImage: editedInfo.userImage || "",
        userBanner: editedInfo.userBanner || ""
      };

      setFullUserInfo(updatedInfo);

      // 기업 회원인 경우 userNickname도 userName으로 업데이트
      const displayNickname = isCompany ? updatedInfo.userName : updatedInfo.userNickname;

      setUserInfo({
        userNum: updatedInfo.userNum,
        userNickname: displayNickname,
        userImage: updatedInfo.userImage,
        userBanner: updatedInfo.userBanner
      });

      // 캐시 업데이트
      updateUserInfoCache({
        userName: updatedInfo.userName,
        userNickname: displayNickname,
        userEmail: updatedInfo.userEmail,
        userImage: updatedInfo.userImage,
        userBanner: updatedInfo.userBanner
      });

      // Header와 다른 컴포넌트에 프로필 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('userProfileUpdated', {
        detail: {
          userImage: updatedInfo.userImage,
          userBanner: updatedInfo.userBanner,
          userNickname: displayNickname
        }
      }));

      setIsEditing(false);
      setProfilePreview(null);
      setBannerPreview(null);
      setSuccessMessage("정보가 성공적으로 수정되었습니다.");
      setTimeout(() => setSuccessMessage(""), 3000);

      // 닉네임이 변경된 경우 URL도 업데이트
      if (nickname !== displayNickname) {
        navigate(`/mypage/${displayNickname}`, { replace: true });
      }
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

    // 닉네임이 변경되면 중복 검사 상태 초기화
    if (name === "userNickname") {
      setNicknameCheckStatus("");
      setIsNicknameChecked(false);
    }
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
    setProfilePreview(null);
    setEditedInfo((prev) => ({
      ...prev,
      userImage: "",
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
      const apiUrl = isCompany
        ? `/api/company/info/${fullUserInfo.userId}/password`
        : `/api/user/info/${fullUserInfo.userId}/password`;

      await axios.put(
        apiUrl,
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
                profilePreview ||
                (isEditing && editedInfo.userImage && editedInfo.userImage.trim() !== ""
                  ? editedInfo.userImage
                  : !isEditing && userInfo?.userImage && userInfo.userImage.trim() !== ""
                  ? (userInfo.userImage.startsWith('data:') ? userInfo.userImage : `data:image/jpeg;base64,${userInfo.userImage}`)
                  : UserDefaultIcon)
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
                {((profilePreview && profilePreview !== UserDefaultIcon) ||
                  (editedInfo.userImage && editedInfo.userImage.trim() !== "")) && (
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

            {/* 팔로우 통계 */}
            <div className="profile-stats">
              <div
                className="stat-item clickable"
                ref={followersRef}
                onClick={() => {
                  setFollowPopoverTab('followers');
                  setShowFollowPopover(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className="stat-number">{followersCount}</span>
                <span className="stat-label">팔로워</span>
              </div>
              <div
                className="stat-item clickable"
                ref={followingRef}
                onClick={() => {
                  setFollowPopoverTab('following');
                  setShowFollowPopover(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className="stat-number">{followingCount}</span>
                <span className="stat-label">팔로잉</span>
              </div>
            </div>

            {/* 팔로우 버튼 (다른 사용자의 프로필일 때만 표시) */}
            {!isOwner && (
              <button
                className={`follow-button ${isFollowingUser ? 'following' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? '처리 중...' : isFollowingUser ? '팔로잉' : '팔로우'}
              </button>
            )}
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
                      <span className="post-badge">{getBoardTypeName(post.boardType)}</span>
                      <h3 className="post-title">{post.title}</h3>
                    </div>
                    <div className="post-bottom-row">
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="post-meta">
                        <span>조회 {post.viewCnt || 0}</span>
                        {post.boardType === 'free' && (
                          <span className="post-likes">추천 {post.likeCnt || 0}</span>
                        )}
                        {post.boardType === 'lookup' && post.price && (
                          <span className="post-price">{post.price.toLocaleString()}원</span>
                        )}
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
                    value={fullUserInfo.userId || ""}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="info-item">
                  <label>{isCompany ? "기업명" : "이름"}</label>
                  <input
                    type="text"
                    name="userName"
                    value={fullUserInfo.userName || ""}
                    disabled
                    className="input-disabled"
                  />
                </div>

                {!isCompany && (
                  <div className="info-item">
                    <label>닉네임</label>
                    {isEditing ? (
                      <>
                        <div className="input-with-btn">
                          <input
                            type="text"
                            name="userNickname"
                            placeholder="닉네임을 입력하세요"
                            value={editedInfo.userNickname || ""}
                            onChange={handleChange}
                            className="input-editable"
                          />
                          <button
                            type="button"
                            onClick={handleCheckNickname}
                            className="btn-small"
                            disabled={nicknameCheckStatus === "checking"}
                          >
                            {nicknameCheckStatus === "checking" ? "확인 중..." : "중복확인"}
                          </button>
                        </div>
                        {nicknameCheckStatus === "available" && (
                          <span className="valid-msg">사용 가능한 닉네임입니다.</span>
                        )}
                        {nicknameCheckStatus === "duplicate" && (
                          <span className="error-msg">이미 사용 중인 닉네임입니다.</span>
                        )}
                      </>
                    ) : (
                      <input
                        type="text"
                        value={fullUserInfo.userNickname || ""}
                        disabled
                        className="input-disabled"
                      />
                    )}
                  </div>
                )}

                <div className="info-item">
                  <label>이메일</label>
                  <input
                    type="email"
                    value={fullUserInfo.userEmail || ""}
                    disabled
                    className="input-disabled"
                  />
                </div>

                <div className="info-item">
                  <label>휴대폰</label>
                  <input
                    type="tel"
                    name="userPhone"
                    value={isEditing ? (editedInfo.userPhone || "") : (fullUserInfo.userPhone || "")}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className={isEditing ? "input-editable" : "input-disabled"}
                  />
                </div>

                {isCompany && (
                  <div className="info-item">
                    <label>사업자번호</label>
                    <input
                      type="text"
                      value={fullUserInfo.businessNumber || ""}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                )}

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
                    onClick={() => handlePostClick(post.postId, post.boardType || 'lookup')}
                  >
                    <div className="post-info-row">
                      <span className="post-badge">{getBoardTypeName(post.boardType || 'lookup')}</span>
                      <h3 className="post-title">{post.title}</h3>
                    </div>
                    <div className="post-bottom-row">
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="post-meta">
                        <span>조회 {post.viewCnt || 0}</span>
                        {post.boardType === 'free' && (
                          <span className="post-likes">추천 {post.likeCnt || 0}</span>
                        )}
                        {post.boardType === 'lookup' && post.price && (
                          <span className="post-price">{post.price.toLocaleString()}원</span>
                        )}
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

      {/* 팔로우 리스트 팝오버 */}
      {showFollowPopover && (userInfo?.userNum || fullUserInfo?.userNum) && (
        <FollowListPopover
          userNum={userInfo?.userNum || fullUserInfo?.userNum}
          initialTab={followPopoverTab}
          onClose={() => setShowFollowPopover(false)}
          anchorEl={followPopoverTab === 'followers' ? followersRef.current : followingRef.current}
        />
      )}
    </div>
  );
};

export default UserProfile;