import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import ScrollToTop from "../components/ScrollToTop"; 
import "./NoFooterLayout.css";

const NoFooterLayout = () => {
  return (
    <div className="main-layout">
      <ScrollToTop /> 
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default NoFooterLayout;