import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPage.css";
import binheartIcon from "../assets/binheart.png";
import eyeIcon from "../assets/Eye.png";
import bookmarkFilledIcon from "../assets/FilldBookmark.png";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("lookup"); // "lookup" or "job"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);

        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!storedUser) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const loggedInUser = JSON.parse(storedUser);
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (activeTab === "lookup") {
          // BoardLookup 저장된 게시글 가져오기
          const savedIdsResponse = await axios.get(
            `http://localhost:8080/api/boardlookup/user/${loggedInUser.userNum}/saved`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              withCredentials: true,
            }
          );

          if (!savedIdsResponse.data || savedIdsResponse.data.length === 0) {
            setSavedPosts([]);
            setLoading(false);
            return;
          }

          // 각 게시글의 상세 정보 가져오기
          const postDetailsPromises = savedIdsResponse.data.map((postId) =>
            axios.get(`http://localhost:8080/api/boardlookup/${postId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              withCredentials: true,
            })
          );

          const postDetailsResponses = await Promise.all(postDetailsPromises);
          const posts = postDetailsResponses.map((res) => res.data.post || res.data);

          // 데이터 변환
          const transformedPosts = posts.map((post) => {
            let tagsArray = [];
            try {
              tagsArray = typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags || [];
            } catch (e) {
              console.error("태그 파싱 실패:", e);
            }

            let imageUrl = "https://cdn.dribbble.com/userupload/12461999/file/original-251950a7c4585c49086113b190f7f224.png?resize=1024x768";
            if (post.pdfImages && post.pdfImages.length > 0) {
              imageUrl = `http://localhost:8080${post.pdfImages[0]}`;
            } else if (post.postFile) {
              imageUrl = `http://localhost:8080/uploads/${post.postFile}`;
            }

            return {
              id: post.postId,
              type: "lookup",
              title: post.title,
              author: post.userNickname,
              imageUrl: imageUrl,
              price: post.price || 0,
              likes: post.likeCnt || 0,
              views: post.viewCnt || 0,
              tags: tagsArray,
              createdAt: post.createdAt,
            };
          });

          setSavedPosts(transformedPosts);
        } else {
          // 채용공고 북마크 가져오기
          const jobsResponse = await axios.get(
            `http://localhost:8080/api/jobs/bookmarks`,
            {
              params: { page: 0, size: 100 },
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              withCredentials: true,
            }
          );

          if (!jobsResponse.data.content || jobsResponse.data.content.length === 0) {
            setSavedPosts([]);
            setLoading(false);
            return;
          }

          // 데이터 변환
          const transformedJobs = jobsResponse.data.content.map((job) => ({
            id: job.postId,
            type: "job",
            title: job.title,
            author: job.companyName,
            companyLogo: job.companyLogo,
            jobRegion: job.jobRegion,
            jobCareerType: job.jobCareerType,
            jobSalaryMin: job.jobSalaryMin,
            jobSalaryMax: job.jobSalaryMax,
            jobDeadline: job.jobDeadline,
            views: job.viewCnt || 0,
            createdAt: job.createdAt,
            isNew: job.isNew,
            isDeadlineSoon: job.isDeadlineSoon,
            daysLeft: job.daysLeft,
          }));

          setSavedPosts(transformedJobs);
        }

        setLoading(false);

      } catch (err) {
        console.error("저장된 게시글 조회 실패:", err);
        setError("저장한 게시글을 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [navigate, activeTab]);

  const handlePostClick = (post) => {
    if (post.type === "lookup") {
      navigate(`/board/lookup/${post.id}`);
    } else {
      navigate(`/boardjob/${post.id}`);
    }
  };

  const handleUnsave = async (e, post) => {
    e.stopPropagation();

    if (!window.confirm("저장을 취소하시겠습니까?")) return;

    try {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!storedUser) {
        alert("로그인이 필요합니다.");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      if (post.type === "lookup") {
        // BoardLookup 저장 취소
        const response = await axios.post(
          `http://localhost:8080/api/boardlookup/${post.id}/save`,
          null,
          {
            params: { userNum: loggedInUser.userNum },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
        }
      } else {
        // 채용공고 북마크 취소
        const response = await axios.post(
          `http://localhost:8080/api/jobs/${post.id}/bookmark`,
          null,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );

        if (response.data.bookmarked === false) {
          setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
        }
      }
    } catch (err) {
      console.error("저장 취소 실패:", err);
      alert("저장 취소에 실패했습니다.");
    }
  };

  const formatRegion = (region) => {
    if (!region) return "";
    const regionMap = {
      SEOUL: "서울",
      BUSAN: "부산",
      DAEGU: "대구",
      INCHEON: "인천",
      GWANGJU: "광주",
      DAEJEON: "대전",
      ULSAN: "울산",
      SEJONG: "세종",
      GYEONGGI: "경기",
      GANGWON: "강원",
      CHUNGBUK: "충북",
      CHUNGNAM: "충남",
      JEONBUK: "전북",
      JEONNAM: "전남",
      GYEONGBUK: "경북",
      GYEONGNAM: "경남",
      JEJU: "제주",
    };
    const mainRegion = region.split("_")[0];
    return regionMap[mainRegion] || region;
  };

  const formatCareerType = (type) => {
    const typeMap = {
      NEWCOMER: "신입",
      EXPERIENCED: "경력",
      IRRELEVANT: "경력무관",
    };
    return typeMap[type] || type;
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "협의";
    if (min && max) return `${min}만원 ~ ${max}만원`;
    if (min) return `${min}만원 이상`;
    return "협의";
  };

  if (loading) {
    return (
      <div className="mypage-section">
        <div className="loading-message">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage-section">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-browse">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>저장한 게시글</h2>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "lookup" ? "active" : ""}`}
            onClick={() => setActiveTab("lookup")}
          >
            보드룩업
          </button>
          <button
            className={`tab-button ${activeTab === "job" ? "active" : ""}`}
            onClick={() => setActiveTab("job")}
          >
            채용공고
          </button>
        </div>
        <p className="section-count">총 {savedPosts.length}개</p>
      </div>

      {savedPosts.length === 0 ? (
        <div className="empty-state">
          <p>저장한 게시글이 없습니다.</p>
          <button
            onClick={() => navigate(activeTab === "lookup" ? "/" : "/boardjob")}
            className="btn-browse"
          >
            게시글 둘러보기
          </button>
        </div>
      ) : (
        <div className="posts-list">
          {savedPosts.map((post) =>
            post.type === "lookup" ? (
              // BoardLookup 게시글 카드
              <div
                key={post.id}
                className="post-item"
                onClick={() => handlePostClick(post)}
              >
                <div className="post-thumbnail-container">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="post-thumbnail"
                  />
                </div>

                <div className="post-content">
                  <div className="post-info-row">
                    <h3 className="post-title">{post.title}</h3>
                    <button
                      className="unsave-button"
                      onClick={(e) => handleUnsave(e, post)}
                      title="저장 취소"
                    >
                      <img src={bookmarkFilledIcon} alt="저장 취소" />
                    </button>
                  </div>

                  <div className="post-author">{post.author}</div>

                  <div className="post-bottom-row">
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    <div className="post-meta">
                      <div className="post-stats">
                        <div className="stat-item">
                          <img
                            src={binheartIcon}
                            alt="좋아요"
                            style={{ width: "14px", height: "14px", opacity: 0.7 }}
                          />
                          <span>{post.likes}</span>
                        </div>
                        <div className="stat-item">
                          <img
                            src={eyeIcon}
                            alt="조회수"
                            style={{ width: "14px", height: "14px", opacity: 0.7 }}
                          />
                          <span>{post.views}</span>
                        </div>
                      </div>
                      <span className="post-price">{post.price.toLocaleString()}원</span>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="tag-more">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 채용공고 카드
              <div
                key={post.id}
                className="post-item job-item"
                onClick={() => handlePostClick(post)}
              >
                <div className="post-content job-content">
                  <div className="post-info-row">
                    <div className="job-header">
                      {post.companyLogo && (
                        <img
                          src={post.companyLogo}
                          alt={post.author}
                          className="company-logo-small"
                        />
                      )}
                      <div className="job-title-area">
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-author">{post.author}</div>
                      </div>
                    </div>
                    <button
                      className="unsave-button"
                      onClick={(e) => handleUnsave(e, post)}
                      title="저장 취소"
                    >
                      <img src={bookmarkFilledIcon} alt="저장 취소" />
                    </button>
                  </div>

                  <div className="job-info-tags">
                    {post.jobRegion && (
                      <span className="job-tag">{formatRegion(post.jobRegion)}</span>
                    )}
                    {post.jobCareerType && (
                      <span className="job-tag">
                        {formatCareerType(post.jobCareerType)}
                      </span>
                    )}
                    <span className="job-tag">
                      {formatSalary(post.jobSalaryMin, post.jobSalaryMax)}
                    </span>
                  </div>

                  <div className="post-bottom-row">
                    <div className="job-badges">
                      {post.isNew && <span className="badge badge-new">NEW</span>}
                      {post.isDeadlineSoon && (
                        <span className="badge badge-deadline">
                          마감임박 (D-{post.daysLeft})
                        </span>
                      )}
                    </div>
                    <div className="post-meta">
                      <div className="stat-item">
                        <img
                          src={eyeIcon}
                          alt="조회수"
                          style={{ width: "14px", height: "14px", opacity: 0.7 }}
                        />
                        <span>{post.views}</span>
                      </div>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
