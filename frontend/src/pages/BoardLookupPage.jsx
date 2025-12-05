import "./BoardLookupPage.css";
import SearchIcon from '../assets/search.png';

function BoardLookupPage() {
  return (
    <div className="tag-box">
      <div className="tag-search-area">
        <input 
          type="text" 
          placeholder="Search..." // 사용자에게 보여줄 안내 텍스트
          className="tag-search-bar" 
        />
        <div className="tag-search-circle">
          <img src={SearchIcon} alt="Search Icon" className="search-icon" />
        </div>
      </div>

      <div className="main-content"></div>
    </div>
    

);
  
}

export default BoardLookupPage;
