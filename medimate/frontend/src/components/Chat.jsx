import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import API from '../api';

function MessageBubble({ message, isSender }) {
  return (
    <motion.div
      className={`message ${isSender ? 'sent' : 'received'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="message-content">{message.message}</div>
      <div className="message-time">
        {format(new Date(message.sent_at), 'h:mm a')}
      </div>
    </motion.div>
  );
}

function Chat() {
  // receiverInput holds the username the user types to start a chat
  const [receiverInput, setReceiverInput] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messageEndRef = useRef(null);
  const [showUserSelect, setShowUserSelect] = useState(false);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // fetch users when modal opens
  useEffect(() => {
    if (!showUserSelect) return;
    fetchUsers('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserSelect]);

  const fetchUsers = async (search = '') => {
    setUsersLoading(true);
    setUsersError('');
    try {
      // get current user id to filter out from list
      const meRes = await API.get('/auth/me');
      const meId = meRes.data.user_id || meRes.data.userId || meRes.data.id;
      const res = await API.get(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      const list = res.data || [];
      setUsersList(list.filter((u) => u.user_id !== meId));
    } catch (err) {
      setUsersError('Failed to load users');
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadChat = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const [chatRes, userRes] = await Promise.all([
        API.get(`/chats?with_user=${userId}`),
        API.get(`/auth/me`)
      ]);
      setChat(chatRes.data);
      // we keep the other user's id so we can compute sent/received
      setChatUser({ id: userId, name: userRes.data.name || `User #${userId}` });
      setShowUserSelect(false);
    } catch (err) {
      setError('Failed to load chat history');
      setChat([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await API.post('/chats', {
        receiver_id: chatUser.id,
        message: message.trim()
      });
      setMessage('');
      loadChat(chatUser.id);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleUserSelect = async (username) => {
    // lookup username -> user_id via API (keeps backward compatibility)
    setLoading(true);
    try {
      const res = await API.get(`/users/lookup?username=${encodeURIComponent(username)}`);
      const user = res.data;
      setReceiverInput('');
      loadChat(user.user_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to find user');
    } finally {
      setLoading(false);
    }
  };

  const startChatWithUser = (user) => {
    // user = { user_id, name }
    setShowUserSelect(false);
    setChatUser({ id: user.user_id, name: user.name });
    loadChat(user.user_id);
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <motion.div
        className="chat-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Messages</h1>
        <motion.button
          className="new-chat-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUserSelect(true)}
        >
          New Chat
        </motion.button>
      </motion.div>

      {/* Chat Interface */}
      <div className="chat-interface">
        {!chatUser ? (
          <motion.div
            className="start-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="start-chat-icon">💬</div>
            <h2>Start a Conversation</h2>
            <p>Select a user to begin chatting</p>
            <motion.button
              className="select-user-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserSelect(true)}
            >
              Select User
            </motion.button>
          </motion.div>
        ) : (
          <div className="chat-container">
            <div className="chat-header-bar">
              <div className="chat-with">
                Chatting with User #{chatUser.id}
              </div>
            </div>

            <div className="messages-container">
              {loading ? (
                <div className="chat-loading">
                  <motion.div
                    className="loading-dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Loading messages...
                  </motion.div>
                </div>
              ) : chat.length === 0 ? (
                <div className="no-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <>
                  <div className="messages-list">
                    {chat.map((msg, index) => (
                      <MessageBubble
                        key={msg.chat_id || index}
                        message={msg}
                        isSender={msg.sender_id !== chatUser.id}
                      />
                    ))}
                    <div ref={messageEndRef} />
                  </div>
                </>
              )}
            </div>

            <form className="message-form" onSubmit={handleSend}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <motion.button
                type="submit"
                className="send-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!message.trim()}
              >
                Send
              </motion.button>
            </form>
          </div>
        )}
      </div>

      {/* User Selection Modal */}
      <AnimatePresence>
        {showUserSelect && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserSelect(false)}
          >
            <motion.div
              className="user-select-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Start New Chat</h2>
                <div className="form-group">
                  <label>Enter Username or pick from list</label>
                  <input
                    type="text"
                    value={receiverInput}
                    onChange={(e) => setReceiverInput(e.target.value)}
                    placeholder="Type to search usernames"
                    className="form-input"
                  />
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <motion.button
                      className="submit-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fetchUsers(receiverInput)}
                      disabled={usersLoading}
                    >
                      Search
                    </motion.button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {usersLoading ? (
                    <div className="chat-loading">Loading users...</div>
                  ) : usersError ? (
                    <div className="notification error">{usersError}</div>
                  ) : usersList.length === 0 ? (
                    <div className="no-messages">No users found</div>
                  ) : (
                    <div className="users-list" style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {usersList.map((u) => (
                        <button
                          key={u.user_id}
                          className="cancel-btn"
                          style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 8 }}
                          onClick={() => startChatWithUser(u)}
                        >
                          {u.name} <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>{u.email || ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              <div className="form-actions">
                <motion.button
                  className="cancel-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserSelect(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="submit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserSelect(receiverInput)}
                  disabled={!receiverInput}
                >
                  Start Chat
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="notification error"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chat;
