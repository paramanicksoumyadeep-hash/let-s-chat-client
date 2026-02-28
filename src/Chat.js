import React, { useEffect, useRef, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const fileInputRef = useRef(null);

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const messageData = {
      room,
      author: username,
      message: currentMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", messageData);
    setMessageList((list) => [...list, messageData]);
    setCurrentMessage("");
  };

  useEffect(() => {
    const savedBg = localStorage.getItem("chatBackground");
    if (savedBg) {
      document.documentElement.style.setProperty(
        "--chat-bg",
        `url(${savedBg})`
      );
    }
  }, []);
  useEffect(() => {
    socket.emit("join_room", room);

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => socket.off("receive_message");
  }, [socket, room]);

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      document.documentElement.style.setProperty(
        "--chat-bg",
        `url(${imageUrl})`
      );
      localStorage.setItem("chatBackground", imageUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <div>
          <h3>Lets-Chat 💬</h3>
          <span>Room: {room}</span>
        </div>

        <div className="header-right">
          <button
            className="bg-btn"
            onClick={() => fileInputRef.current.click()}
          >
            Change BG
          </button>
          <div className="user-name">{username}</div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleBackgroundChange}
          style={{ display: "none" }}
        />
      </div>

      {/* BODY */}
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.author === username ? "you" : "other"
              }`}
            >
              <div className="message-bubble">
                <p className="message-text">{msg.message}</p>
                <div className="message-meta">
                  <span>{msg.author}</span>
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>

      {/* FOOTER */}
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type a message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

export default Chat;
