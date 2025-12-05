import "./BoardLookupPage.css";
import SearchIcon from '../assets/search.png';

function BoardLookupPage() {
  return (
    <div className="tag-box">
      <div className="tag-search-area">
        <div className="tag-search-bar">Search...</div>
        <div className="tag-search-circle">
          <img src={SearchIcon} alt="Search Icon" className="search-icon" />
        </div>
      </div>
    </div>
    

);
  
}

export default BoardLookupPage;
