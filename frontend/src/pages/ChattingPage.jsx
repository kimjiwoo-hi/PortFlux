import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./ChattingPage.css";
import { getChatMessages, getOrCreateChatRoom } from "../api/api";

const ChattingPage = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState(null);
  const currentUserId = 1; // Hardcoded user ID
  const otherUserId = 2; // Hardcoded other user ID

  useEffect(() => {
    // Fetch or create chat room
    const fetchRoom = async () => {
      try {
        const response = await getOrCreateChatRoom({
          user1Num: currentUserId,
          user2Num: otherUserId,
        });
        const fetchedRoomId = response.data.roomId;
        setRoomId(fetchedRoomId);

        const messagesResponse = await getChatMessages(fetchedRoomId);
        setMessages(messagesResponse.data);

        // Establish socket connection
        const newSocket = io("http://localhost:8080"); // Assuming backend runs on 8080
        setSocket(newSocket);

        newSocket.emit("joinRoom", fetchedRoomId.toString());

        newSocket.on("chatMessage", (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });
      } catch (error) {
        console.error("Error setting up chat:", error);
      }
    };

    fetchRoom();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (socket && newMessage.trim() !== "") {
      const messagePayload = {
        roomId: roomId,
        senderNum: currentUserId,
        content: newMessage,
        // other fields as needed by ChatMessageBean
      };
      socket.emit("chatMessage", messagePayload);
      setNewMessage("");
    }
  };

  return (
    <div className="chatting-page">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderNum === currentUserId ? "sent" : "received"
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChattingPage;
