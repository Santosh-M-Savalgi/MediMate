import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import API from '../api';

function CommentCard({ comment, onLike, liked }) {
  // derive display name
  const name = comment.doctor_name || `Doctor #${comment.doctor_id}`;

  const [expanded, setExpanded] = useState(false);

  const content = comment.content || '';
  const short = content.length > 220 && !expanded ? content.slice(0, 220) + '…' : content;

  return (
    <motion.div
      className={`comment-card ${comment.pinned ? 'pinned' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="comment-header">
        <div className="comment-author">
          <div className="author-avatar" style={{ background: avatarColor(name) }}>
            {name[0]?.toUpperCase() || 'D'}
          </div>
          <div className="author-info">
            <div className="author-name">{name}</div>
            <div className="author-role">{comment.doctor_role || 'Doctor'}</div>
          </div>
        </div>

        <div className="comment-meta">
          {comment.pinned && <span className="pinned-badge">Pinned</span>}
          <div className="comment-time" title={format(new Date(comment.created_at), 'PPpp')}>
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>

      <div className="comment-content">
        <div className="comment-text">{short}</div>
        {content.length > 220 && (
          <button className="read-more" onClick={() => setExpanded(s => !s)} aria-expanded={expanded}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      <div className="comment-actions">
        <motion.button
          className={`like-btn ${liked ? 'liked' : ''}`}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLike(comment.comment_id)}
          aria-pressed={liked}
          aria-label={`Like comment by ${name}`}
        >
          👍 <span className="like-count">{comment.like_count || 0}</span>
        </motion.button>

        {/* quick reactions */}
        <div className="reactions">
          {(comment.reactions || [{r:'❤️',c:0},{r:'😂',c:0},{r:'🤝',c:0}]).map((rx, i) => (
            <motion.button key={i} className="reaction-btn" whileTap={{ scale: 0.95 }} onClick={() => { /* future: send reaction */ }}>
              {rx.r} <span className="reaction-count">{rx.c}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// simple deterministic avatar color generator
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 40) % 360} 70% 55%))`;
}

function Comments() {
  const [postId, setPostId] = useState('');
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState({});
  const [postsList, setPostsList] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  // load posts for selection
  useEffect(() => {
    const loadPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await API.get('/posts');
        setPostsList(res.data || []);
      } catch (e) {
        console.error('Failed to load posts', e);
        setPostsList([]);
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const loadComments = async (id) => {
    if (!id) return;
    setLoading(true);
    setErr('');
    try {
      const res = await API.get(`/comments?post_id=${id}`);
      // normalize like_count to numeric and build likes map
      const data = res.data.map(c => ({ ...c, like_count: Number(c.like_count || 0) }));
      setComments(data);
      const map = {};
      data.forEach(c => { map[c.comment_id] = false; });
      setLikes(map);
    } catch (e) {
      setComments([]);
      setErr('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await API.post('/comments', { post_id: postId, content });
      setContent('');
      setMsg('Comment posted successfully!');
      setShowCommentForm(false);
      loadComments(postId);
    } catch (e) {
      setErr('Failed to post comment');
    }
  };

  const handleLike = (commentId) => {
    // optimistic UI: toggle liked and update comment.like_count locally
    setLikes(prev => {
      const cur = !!prev[commentId];
      const next = { ...prev, [commentId]: !cur };
      setComments(cs => cs.map(c => c.comment_id === commentId ? { ...c, like_count: (c.like_count || 0) + (cur ? -1 : 1) } : c));
      return next;
    });
    // optionally: send API request to record reaction
    // API.post(`/comments/${commentId}/react`, { type: 'like' }).catch(() => {});
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...comments];
    // pinned first
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    if (!q) return list;
    return list.filter(c => (
      (c.content || '').toLowerCase().includes(q) ||
      (c.doctor_name || '').toLowerCase().includes(q)
    ));
  }, [comments, searchQuery]);

  // small header summary
  const totalLikes = comments.reduce((s, c) => s + (Number(c.like_count || 0)), 0);

  return (
    <div className="comments-page">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>Comments</h1>
          <p className="header-subtitle">Join the discussion on posts</p>
        </div>
      </motion.div>

      {/* Post Selection & hero */}
      <div className="post-select">
        <div className="form-group" style={{ alignItems: 'center', gap: 12 }}>
          {postsLoading ? (
            <div>Loading posts...</div>
          ) : (
            <>
              <select
                value={selectedPost?.post_id || ''}
                onChange={e => {
                  const id = e.target.value;
                  setPostId(id);
                  const post = postsList.find(p => String(p.post_id) === String(id));
                  setSelectedPost(post || null);
                }}
                className="form-input"
              >
                <option value="">Select a post...</option>
                {postsList.map(p => (
                  <option key={p.post_id} value={p.post_id}>{p.title} {p.author_name ? `— ${p.author_name}` : ''}</option>
                ))}
              </select>

              <motion.button
                className="load-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadComments(postId)}
                disabled={!postId}
              >
                Load Comments
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="comments-hero">
        <div className="hero-left">
          <h2>Discussion</h2>
          <p className="hero-lead">Engage with the community — helpful answers, feedback and notes.</p>
        </div>
        <div className="hero-right">
          <div className="hero-stat">
            <div className="stat-value">{comments.length}</div>
            <div className="stat-label">Comments</div>
          </div>
          <div className="hero-stat">
            <div className="stat-value">{totalLikes}</div>
            <div className="stat-label">Likes</div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <div className="comments-header">
          <div>
            <h2>Comments {postId && `for Post #${postId}`}</h2>
            <div className="comment-count">{comments.length} total</div>
          </div>

          <div className="comments-controls">
            <input
              className="comment-search"
              placeholder="Search comments or author..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {postId && (
              <motion.button
                className="new-comment-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCommentForm(true)}
              >
                Add Comment
              </motion.button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="comments-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="loading-spinner"
            />
            Loading comments...
          </div>
        ) : (
          <div className="comments-list">
            {filtered.length === 0 ? (
              <motion.div
                className="no-comments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {postId ? 'No comments yet' : 'Select a post to view comments'}
              </motion.div>
            ) : (
              <AnimatePresence>
                {filtered.map((comment, index) => (
                  <CommentCard key={comment.comment_id} comment={comment} onLike={handleLike} liked={!!likes[comment.comment_id]} />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* New Comment Modal */}
      <AnimatePresence>
        {showCommentForm && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommentForm(false)}
          >
            <motion.div
              className="comment-form-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Add Comment</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <textarea
                    placeholder="Write your comment..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="form-input"
                    rows={4}
                    required
                  />
                </div>
                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="cancel-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCommentForm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!content.trim()}
                  >
                    Post Comment
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {msg && (
          <motion.div
            className="notification success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {msg}
          </motion.div>
        )}
        {err && (
          <motion.div
            className="notification error"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {err}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Comments;
