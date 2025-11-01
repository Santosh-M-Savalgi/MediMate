import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import API from '../api';

const categories = [
  { id: 'general', label: 'General', icon: '📝' },
  { id: 'question', label: 'Question', icon: '❓' },
  { id: 'experience', label: 'Experience', icon: '🗣️' },
  { id: 'advice', label: 'Advice', icon: '💡' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' }
];

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', description: '', category: 'general' });
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await API.get('/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await API.post('/posts', newPost);
      setSuccess('Post created successfully!');
      setNewPost({ title: '', description: '', category: 'general' });
      setShowForm(false);
      loadPosts();
    } catch (err) {
      setError('Failed to create post');
    }
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.category === filter);

  if (loading) {
    return (
      <div className="page-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        />
        Loading posts...
      </div>
    );
  }

  return (
    <div className="posts-page">
      {/* Header Section */}
      <motion.div 
        className="posts-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>Community Posts</h1>
          <p className="header-subtitle">Share and discuss with the community</p>
        </div>
        <motion.button
          className="new-post-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
        >
          Create Post
        </motion.button>
      </motion.div>

      {/* Category Filter */}
      <div className="category-filters">
        <motion.button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('all')}
        >
          🔍 All Posts
        </motion.button>
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(cat.id)}
          >
            {cat.icon} {cat.label}
          </motion.button>
        ))}
      </div>

      {/* New Post Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="post-form-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Create New Post</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Post Title"
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Post Description"
                    value={newPost.description}
                    onChange={e => setNewPost({...newPost, description: e.target.value})}
                    required
                    className="form-input"
                    rows={5}
                  />
                </div>
                <div className="form-group">
                  <select
                    value={newPost.category}
                    onChange={e => setNewPost({...newPost, category: e.target.value})}
                    className="form-input"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="cancel-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Post
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Grid */}
      <div className="posts-grid">
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.post_id}
              className="post-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="post-category">
                {categories.find(cat => cat.id === post.category)?.icon || '📝'}
                {post.category}
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              <div className="post-meta">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.author_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{post.author_name || 'Unknown'}</span>
                </div>
                <div className="post-time">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notifications */}
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
        {success && (
          <motion.div
            className="notification success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Posts;
