import React from 'react';
import Posts from '../components/Posts.jsx';
import Comments from '../components/Comments.jsx';

export default function PostsCommentsPage() {
  return (
    <div className="mm-container">
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <div>
          <Posts />
        </div>
        <aside>
          <Comments />
        </aside>
      </div>
    </div>
  );
}
