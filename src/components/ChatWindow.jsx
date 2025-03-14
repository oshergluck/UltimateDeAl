// src/components/ChatWindow.jsx
import React, { useEffect, useState } from "react";
import { signInAnonymouslyUser, messagesRef, addMessage } from "../firebaseConfig";
import { onValue } from "firebase/database";

const ChatWindow = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUrl = window.location.pathname.replace("/", "");  // Chat based on current URL

  // Authenticate user on mount
  useEffect(() => {
    signInAnonymouslyUser().then((result) => {
      setUser(result.user);
    });
  }, []);

  // Fetch messages from Firebase when component mounts
  useEffect(() => {
    const messagesListener = onValue(messagesRef(currentUrl), (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data ? Object.values(data) : [];
      setMessages(loadedMessages);
    });
    return () => messagesListener(); // Cleanup listener
  }, [currentUrl]);

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      addMessage(currentUrl, { text: newMessage, uid: user.uid, timestamp: Date.now() });
      setNewMessage("");
    }
  };

  return (
    <div className="chat-window border p-4 rounded shadow-lg w-96 bg-white">
      <h2 className="font-bold text-xl mb-2">Chat Room</h2>
      <div className="messages overflow-y-scroll h-60 border-b mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="message p-1 my-1">
            <span className="text-gray-700 font-medium">{msg.uid === user?.uid ? "You" : "User"}:</span>
            <span className="ml-2 text-gray-900">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="border rounded p-1 w-full mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;
