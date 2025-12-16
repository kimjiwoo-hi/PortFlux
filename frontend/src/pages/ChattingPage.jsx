import React, { useState, useEffect, userRef } from "react";
import {io} from "socket.io-client";
import "./ChattingPage.css";

const ChattingPage = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  
  return (
    <div className="chatting-page"/> 
    );
};

export default ChattingPage;