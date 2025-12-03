import React from "react";
import "./Footer.css";
import PortFluxLogo from "../assets/PortFlux.png";
import GithubLogo from "../assets/github.svg";
import NotionLogo from "../assets/notion.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-object">
        <div className="logo">
          <img src={PortFluxLogo} alt="PortFluxLogo.png" />
        </div>
        <div className="icon-row">
          <img src={GithubLogo} alt="Github Icon" />
          <img src={NotionLogo} alt="Notion Icon" />
        </div>
      </div>
      <div className="footer-row">
        <div className="footer-object">
          <h2>Language</h2>
          <div className="row">
            <p>JavaScript</p>
            <p>Java</p>
            <p>SQL</p>
          </div>
        </div>
        <div className="footer-object">
          <h2>Skill</h2>
          <div className="row">
            <p>React</p>
            <p>Spring Boot</p>
            <p>Oracle</p>
          </div>
        </div>
        <div className="footer-object">
          <h2>Tool</h2>
          <div className="row">
            <p>VS Code</p>
            <p>Git</p>
            <p>Notion</p>
          </div>
        </div>
        <div className="reserved">
          <p>© 2025 Team JH. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
