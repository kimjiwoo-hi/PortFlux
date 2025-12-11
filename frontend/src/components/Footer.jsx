import React from "react";
import "./Footer.css";
import PortFluxLogo from "../assets/PortFlux.png";
import GithubLogo from "../assets/github.svg";
import NotionLogo from "../assets/notion.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="logo">
            <img src={PortFluxLogo} alt="PortFluxLogo.png" />
          </div>
          <p className="copyright">© 2025 Team JH. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <div className="footer-link-group">
              <h3>Tech Stack</h3>
              <ul>
                <li>JavaScript</li>
                <li>React</li>
                <li>Java</li>
                <li>Spring Boot</li>
                <li>SQL</li>
                <li>Oracle</li>
              </ul>
            </div>
            <div className="footer-link-group">
              <h3>Tools</h3>
              <ul>
                <li>VS Code</li>
                <li>Git</li>
                <li>Notion</li>
              </ul>
            </div>
            <div className="footer-link-group">
              <h3>Contact</h3>
              <div className="social-icons">
                <a
                  href="https://github.com/kimjiwoo-hi/PortFlux"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={GithubLogo} alt="Github Icon" />
                </a>
                <a
                  href="https://www.notion.so/J-H-2b4de73ed55681948a16ea1b73604e92?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={NotionLogo} alt="Notion Icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
