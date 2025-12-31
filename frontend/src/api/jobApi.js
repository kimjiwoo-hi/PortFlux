/**
 * 채용공고 API 모듈
 * 백엔드 JobController와 연동
 * 인증: 세션 기반 (credentials: include)
 */

const API_BASE = "http://localhost:8080/api/jobs";

/**
 * 로컬/세션 스토리지에서 사용자 정보 가져오기
 */
const getUser = () => {
  // 1. 먼저 user 객체가 저장되어 있는지 확인
  const possibleKeys = [
    "user",
    "User",
    "currentUser",
    "loginUser",
    "authUser",
    "member",
  ];

  for (const key of possibleKeys) {
    const userStr =
      localStorage.getItem(key) || sessionStorage.getItem(key);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user;
      } catch {
        // JSON 파싱 실패 시 다음 키 시도
      }
    }
  }

  // 2. user 객체가 없으면 개별 필드들을 조합해서 user 객체 생성
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    const storage = localStorage.getItem("isLoggedIn")
      ? localStorage
      : sessionStorage;

    const userObject = {
      id: storage.getItem("userId"),
      name: storage.getItem("userNickname"),
      num: storage.getItem("userNum"),
      role: storage.getItem("role"),
      memberType: storage.getItem("memberType"),
      token: storage.getItem("token"),
    };

    // 최소한 id가 있으면 user 객체로 간주
    if (userObject.id) {
      return userObject;
    }
  }

  return null;
};

/**
 * API 요청 헬퍼 함수
 * 세션 기반 인증을 위해 credentials: include 사용
 * JWT 토큰이 있으면 Authorization 헤더에 추가
 */
const fetchApi = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // JWT 토큰 추가
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error(errorData.message || "로그인이 필요합니다.");
    }

    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

/**
 * 채용공고 목록 조회
 */
export const getJobs = async (
  filters = {},
  page = 0,
  size = 20,
  sort = "latest"
) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);
  params.append("sort", sort);

  if (filters.regions?.length > 0) {
    params.append("regions", JSON.stringify(filters.regions));
  }
  if (filters.careerType?.length > 0) {
    params.append("careerType", JSON.stringify(filters.careerType));
  }
  if (filters.careerYears?.length > 0) {
    params.append("careerYears", JSON.stringify(filters.careerYears));
  }
  if (filters.industries?.length > 0) {
    params.append("industries", JSON.stringify(filters.industries));
  }
  if (filters.companyTypes?.length > 0) {
    params.append("companyTypes", JSON.stringify(filters.companyTypes));
  }
  if (filters.workTypes?.length > 0) {
    params.append("workTypes", JSON.stringify(filters.workTypes));
  }
  if (filters.workDays?.length > 0) {
    params.append("workDays", JSON.stringify(filters.workDays));
  }

  if (filters.education) {
    params.append("education", filters.education);
  }
  if (filters.educationExclude) {
    params.append("educationExclude", filters.educationExclude);
  }
  if (filters.salaryMin) {
    params.append("salaryMin", filters.salaryMin);
  }
  if (filters.keyword) {
    params.append("keyword", filters.keyword);
  }

  return fetchApi(`${API_BASE}?${params.toString()}`);
};

/**
 * 채용공고 상세 조회
 */
export const getJobDetail = async (postId) => {
  const data = await fetchApi(`${API_BASE}/${postId}`);
  return {
    ...data.job,
    isOwner: data.isOwner,
  };
};

/**
 * 채용공고 생성
 */
export const createJob = async (jobData) => {
  return fetchApi(API_BASE, {
    method: "POST",
    body: JSON.stringify(jobData),
  });
};

/**
 * 채용공고 수정
 */
export const updateJob = async (postId, jobData) => {
  return fetchApi(`${API_BASE}/${postId}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
};

/**
 * 채용공고 삭제
 */
export const deleteJob = async (postId) => {
  return fetchApi(`${API_BASE}/${postId}`, {
    method: "DELETE",
  });
};

/**
 * 채용공고 상태 변경
 */
export const updateJobStatus = async (postId, status) => {
  return fetchApi(`${API_BASE}/${postId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

/**
 * 북마크 토글
 */
export const toggleBookmark = async (postId) => {
  return fetchApi(`${API_BASE}/${postId}/bookmark`, {
    method: "POST",
  });
};

/**
 * 북마크 상태 확인
 */
export const checkBookmarkStatus = async (postId) => {
  return fetchApi(`${API_BASE}/${postId}/bookmark/status`);
};

/**
 * 북마크 목록 조회
 */
export const getBookmarks = async (page = 0, size = 20) => {
  const params = new URLSearchParams({ page, size });
  return fetchApi(`${API_BASE}/bookmarks?${params.toString()}`);
};

/**
 * 지역별 채용공고 개수 조회
 */
export const getJobCountByRegion = async () => {
  return fetchApi(`${API_BASE}/count-by-region`);
};

/**
 * 내 채용공고 목록 (기업 전용)
 */
export const getMyJobs = async (page = 0, size = 20) => {
  const params = new URLSearchParams({ page, size });
  return fetchApi(`${API_BASE}/my?${params.toString()}`);
};

/**
 * 로그인 여부 확인 유틸리티
 */
export const isLoggedIn = () => {
  const user = getUser();
  return user !== null;
};

/**
 * 기업 회원 여부 확인 유틸리티
 */
export const isCompanyUser = () => {
  const user = getUser();

  if (!user) return false;

  // 다양한 필드명 체크 (대소문자 구분 없이)
  const role = user.role || user.Role || user.ROLE;
  const memberType = user.memberType || user.MemberType || user.member_type;
  const type = user.type || user.Type;

  // 기업 회원 확인 (대소문자 무시)
  if (role && role.toUpperCase() === "COMPANY") return true;
  if (memberType && memberType.toLowerCase() === "company") return true;
  if (type && type.toLowerCase() === "company") return true;

  return false;
};

export default {
  getJobs,
  getJobDetail,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  toggleBookmark,
  checkBookmarkStatus,
  getBookmarks,
  getJobCountByRegion,
  getMyJobs,
  isLoggedIn,
  isCompanyUser,
};
