/**
 * 사용자 정보 캐싱 유틸리티
 * Header와 Popover에서 중복 API 호출을 방지
 */

import { preloadImages } from './imageCache';

// 사용자 정보 캐시
let userInfoCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

/**
 * 캐시가 유효한지 확인
 */
const isCacheValid = () => {
  if (!userInfoCache || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

/**
 * 사용자 정보 가져오기 (캐시 우선)
 * @param {boolean} forceRefresh - 강제 새로고침 여부
 * @returns {Promise<Object>} 사용자 정보
 */
export const fetchUserInfo = async (forceRefresh = false) => {
  // 캐시가 유효하고 강제 새로고침이 아니면 캐시 반환
  if (!forceRefresh && isCacheValid()) {
    return Promise.resolve(userInfoCache);
  }

  const storage = localStorage.getItem("isLoggedIn") ? localStorage : sessionStorage;
  let userId = storage.getItem("userId");

  if (!userId) {
    const storedUser = storage.getItem("user");
    if (storedUser) {
      try {
        userId = JSON.parse(storedUser).userId;
      } catch (e) {
        console.error("Failed to parse user info:", e);
      }
    }
  }

  if (!userId) {
    return Promise.reject(new Error("No user ID found"));
  }

  const token = storage.getItem("token");

  try {
    // [수정] 절대 경로로 변경
    const response = await fetch(`http://localhost:8080/api/user/info/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // 사용자 정보 캐싱
    userInfoCache = {
      userName: data.userName || data.user_name || "",
      userNickname: data.userNickname || data.user_nickname || storage.getItem("userNickname") || "사용자",
      userEmail: data.userEmail || data.user_email || userId,
      userImage: data.userImage || null,
      userBanner: data.userBanner || null
    };
    cacheTimestamp = Date.now();

    // 이미지 프리로드
    const imagesToPreload = [userInfoCache.userImage, userInfoCache.userBanner].filter(Boolean);
    if (imagesToPreload.length > 0) {
      preloadImages(imagesToPreload).catch(err => {
        console.warn("Image preload failed:", err);
      });
    }

    return userInfoCache;
  } catch (error) {
    console.error("User info fetch error:", error);
    throw error;
  }
};

/**
 * 캐시된 사용자 정보 가져오기 (API 호출 없음)
 * @returns {Object|null} 캐시된 사용자 정보 또는 null
 */
export const getCachedUserInfo = () => {
  return isCacheValid() ? userInfoCache : null;
};

/**
 * 사용자 정보 캐시 무효화
 */
export const invalidateUserInfoCache = () => {
  userInfoCache = null;
  cacheTimestamp = null;
};

/**
 * 사용자 정보 업데이트 (캐시 갱신)
 * @param {Object} newInfo - 새로운 사용자 정보
 */
export const updateUserInfoCache = (newInfo) => {
  userInfoCache = { ...userInfoCache, ...newInfo };
  cacheTimestamp = Date.now();

  // 이미지 프리로드
  const imagesToPreload = [newInfo.userImage, newInfo.userBanner].filter(Boolean);
  if (imagesToPreload.length > 0) {
    preloadImages(imagesToPreload).catch(err => {
      console.warn("Image preload failed:", err);
    });
  }
};