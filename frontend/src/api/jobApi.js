/**
 * 채용공고 API 모듈
 * 백엔드 JobController와 연동
 */

const API_BASE = "/api/jobs";

/**
 * API 요청 헬퍼 함수
 */
const fetchApi = async (url, options = {}) => {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
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

  // 배열 필터는 JSON 문자열로 변환
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

  // 단일 값 필터
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
};
