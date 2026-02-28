import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./chat.css";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room,
        author: username,
        message: currentMessage,
        time:
          new Date().getHours().toString().padStart(2, "0") +
          ":" +
          new Date().getMinutes().toString().padStart(2, "0"),
      };

      socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.emit("join_room", room);

    const handleReceiveMessage = (data) => {
      if (data.author !== username) {
        setMessageList((list) => [...list, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, room, username]);

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <div>
          <h3>Lets-Chat 💬</h3>
          <span>Room: {room}</span>
        </div>
        <div className="user-name">{username}</div>
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

