import React, { useState, useEffect, useRef } from 'react';
import { Send, Users } from 'lucide-react';
import io from 'socket.io-client';

const SOCKET_SERVER = 'http://localhost:3001'; // Change this to your server URL in production

const ESHChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);

    // Socket event handlers
    newSocket.on('join_success', (username) => {
      setIsJoined(true);
      setError('');
    });

    newSocket.on('join_error', (errorMessage) => {
      setError(errorMessage);
    });

    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('active_users', (users) => {
      setActiveUsers(users);
    });

    newSocket.on('initial_messages', (messages) => {
      setMessages(messages);
    });

    return () => newSocket.close();
  }, []);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join the chat
  const joinChat = () => {
    if (username.trim() && socket) {
      socket.emit('join', username.trim());
    }
  };

  // Send a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() && socket) {
      socket.emit('message', currentMessage.trim());
      setCurrentMessage('');
    }
  };

  // Username input screen
  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to ESHChat</h1>
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); joinChat(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose your username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">ESHChat</h1>
          <button 
            onClick={() => setShowUserList(!showUserList)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
          >
            <Users className="w-4 h-4" />
            Users ({activeUsers.length})
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-1 max-w-4xl w-full mx-auto p-4 gap-4">
        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'system' ? (
                  <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-center w-full">
                    {message.text}
                  </div>
                ) : (
                  <div className={`max-w-[70%] ${message.sender === username ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
                    <div className="text-xs opacity-75 mb-1">
                      {message.sender} • {message.timestamp}
                    </div>
                    <p>{message.text}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Active Users Sidebar */}
        {showUserList && (
          <div className="w-64 bg-white rounded-lg shadow-md p-4">
            <h2 className="font-bold mb-4">Active Users</h2>
            <div className="space-y-2">
              {activeUsers.map((user, index) => (
                <div
                  key={user.socketId}
                  className="flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className={user.username === username ? 'font-bold' : ''}>
                    {user.username} {user.username === username ? '(You)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESHChat;