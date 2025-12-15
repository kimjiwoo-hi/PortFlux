/**
 * 채용공고 API 서비스
 * 백엔드 Spring Boot 서버와 통신하는 함수들
 */

// 개발 환경 API URL (배포 시 수정 필요)
/* 프론트에 process.env 생성 후 사용 가능
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
*/
const API_BASE_URL = "http://localhost:8080";

/**
 * 채용공고 목록 조회 (필터링, 페이징, 정렬)
 * @param {Object} filters - 필터 조건
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 * @param {string} sort - 정렬 기준 (latest, views, deadline)
 * @returns {Promise<Object>} { content: [], totalElements, totalPages, ... }
 */
export const getJobs = async (
  filters = {},
  page = 0,
  size = 20,
  sort = "latest"
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
    });

    // 필터 파라미터 추가
    if (filters.regions && filters.regions.length > 0) {
      params.append("regions", JSON.stringify(filters.regions));
    }
    if (filters.careerType && filters.careerType.length > 0) {
      params.append("careerType", JSON.stringify(filters.careerType));
    }
    if (filters.careerYears && filters.careerYears.length > 0) {
      params.append("careerYears", JSON.stringify(filters.careerYears));
    }
    if (filters.education) {
      params.append("education", filters.education);
    }
    if (filters.educationExclude) {
      params.append("educationExclude", filters.educationExclude);
    }
    if (filters.industries && filters.industries.length > 0) {
      params.append("industries", JSON.stringify(filters.industries));
    }
    if (filters.companyTypes && filters.companyTypes.length > 0) {
      params.append("companyTypes", JSON.stringify(filters.companyTypes));
    }
    if (filters.workTypes && filters.workTypes.length > 0) {
      params.append("workTypes", JSON.stringify(filters.workTypes));
    }
    if (filters.workDays && filters.workDays.length > 0) {
      params.append("workDays", JSON.stringify(filters.workDays));
    }
    if (filters.salaryMin) {
      params.append("salaryMin", filters.salaryMin);
    }
    if (filters.keyword) {
      params.append("keyword", filters.keyword);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/jobs?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

/**
 * 채용공고 상세 조회 (조회수 증가)
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Object>} 채용공고 상세 정보
 */
export const getJobDetail = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching job detail:", error);
    throw error;
  }
};

/**
 * 채용공고 생성 (기업 전용)
 * @param {Object} jobData - 채용공고 데이터
 * @returns {Promise<Object>} 생성된 채용공고
 */
export const createJob = async (jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

/**
 * 채용공고 수정 (작성 기업 전용)
 * @param {number} postId - 게시글 ID
 * @param {Object} jobData - 수정할 채용공고 데이터
 * @returns {Promise<Object>} 수정된 채용공고
 */
export const updateJob = async (postId, jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

/**
 * 채용공고 삭제 (작성 기업 전용)
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteJob = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

/**
 * 채용공고 상태 변경 (작성 기업 전용)
 * @param {number} postId - 게시글 ID
 * @param {string} status - 변경할 상태 (ACTIVE/CLOSED)
 * @returns {Promise<Object>} 변경 결과
 */
export const updateJobStatus = async (postId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${postId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating job status:", error);
    throw error;
  }
};

/**
 * 북마크 토글 (로그인한 사용자만)
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Object>} { bookmarked: boolean }
 */
export const toggleBookmark = async (postId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/${postId}/bookmark`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

/**
 * 북마크 목록 조회 (로그인한 사용자)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 북마크한 채용공고 목록
 */
export const getMyBookmarks = async (page = 0, size = 20) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/jobs/bookmarks?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
};

/**
 * 지역별 채용공고 개수 조회
 * @returns {Promise<Object>} { seoul_gangnam: 5, seoul_mapo: 3, ... }
 */
export const getJobCountByRegion = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/count-by-region`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching job count by region:", error);
    throw error;
  }
};

/**
 * 내가 작성한 채용공고 목록 조회 (기업 전용)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 내 채용공고 목록
 */
export const getMyJobs = async (page = 0, size = 20) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/jobs/my?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching my jobs:", error);
    throw error;
  }
};

/**
 * 채용공고 북마크 여부 확인
 * @param {number} postId - 게시글 ID
 * @returns {Promise<boolean>} 북마크 여부
 */
export const checkBookmarkStatus = async (postId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/${postId}/bookmark/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.bookmarked;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
};

export default {
  getJobs,
  getJobDetail,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  toggleBookmark,
  getMyBookmarks,
  getJobCountByRegion,
  getMyJobs,
  checkBookmarkStatus,
};
