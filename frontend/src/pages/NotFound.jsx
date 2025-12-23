import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Left Column */}
        <div className="not-found-left">
          <h1>4o4</h1>
          <p className="not-found-subtext">Not Found</p>
        </div>

        {/* Right Column */}
        <div className="not-found-right">
          <h2>페이지를 찾을 수 없습니다.</h2>
          <p>
            요청하신 페이지가 존재하지 않거나, 사용할 수 없는 페이지입니다.
            <br />
            입력하신 주소가 정확한지 다시 한번 확인해주세요.
          </p>
          <button onClick={goToHome} className="info-404-button">
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
