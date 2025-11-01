import React, { useState, useRef } from 'react';
import API from '../api';
import { motion } from 'framer-motion';

/**
 * Redesigned Ratings page
 * - Two-column layout (form + feedback list)
 * - Animated, accessible star control (Framer Motion)
 * - Glassy cards and gradient-filled stars for a premium look
 */
function Ratings() {
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratings, setRatings] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const textareaRef = useRef(null);

  const loadRatings = async () => {
    if (!doctorId) return;
    try {
      const res = await API.get(`/ratings?doctor_id=${doctorId}`);
      setRatings(res.data || []);
      setMsg(''); setErr('');
    } catch (e) {
      setErr('Failed to load ratings.');
      setRatings([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!doctorId || !appointmentId || !rating) {
      setErr('Please provide doctor, appointment and a star rating.');
      return;
    }

    try {
      await API.post('/ratings', { doctor_id: doctorId, appointment_id: appointmentId, rating: Number(rating), feedback });
      setMsg('Feedback submitted!');
      setRating(0); setFeedback(''); setAppointmentId('');
      loadRatings();
      // subtle focus back to textarea after submit
      textareaRef.current && textareaRef.current.focus();
    } catch (e) {
      setErr('Failed to submit rating. Check doctor & appointment IDs.');
    }
  };

  return (
    <div className="ratings-page">
      <section className="rating-form">
        <h3>Doctor Ratings</h3>

        <div className="form-row">
          <input className="input" type="number" placeholder="Doctor ID" value={doctorId} onChange={e => setDoctorId(e.target.value)} />
          <button className="submit-btn" onClick={loadRatings} disabled={!doctorId}>Load</button>
        </div>

        <h4 style={{marginTop:6}}>Leave Feedback</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input className="input" type="number" placeholder="Appointment ID" value={appointmentId} onChange={e => setAppointmentId(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom:6, fontWeight:700 }}>Your Rating</div>
            <div role="radiogroup" aria-label="Star rating" className="stars">
              {[1,2,3,4,5].map(i => (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  animate={{ scale: Number(rating) === i ? 1.06 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`star ${Number(rating) >= i ? 'filled gradient' : ''}`}
                  onClick={() => setRating(i)}
                  aria-pressed={Number(rating) === i}
                  aria-label={`${i} star${i>1?'s':''}`}
                >
                  ★
                </motion.button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <textarea ref={textareaRef} className="input textarea" placeholder="Share your experience" value={feedback} onChange={e => setFeedback(e.target.value)} required />
          </div>

          <button className="submit-btn" type="submit">
            <motion.span whileTap={{ scale: 0.98 }}>Submit Feedback</motion.span>
          </button>
        </form>

        {msg && <div style={{ color: 'var(--accent-1)', marginTop:12 }}>{msg}</div>}
        {err && <div style={{ color: '#ff6b6b', marginTop:12 }}>{err}</div>}
      </section>

      <aside>
        <h4 style={{ marginTop:0 }}>Feedbacks for Doctor #{doctorId || '—'}</h4>
        <div className="feedback-list">
          {ratings.length === 0 && <div style={{ color: 'var(--muted)' }}>No ratings found.</div>}
          {ratings.map(r => (
            <div key={r.id} className="rating-item">
              <div className="avatar">{(r.patient_name || 'P').slice(0,1).toUpperCase()}</div>
              <div className="rating-content">
                <div className="rating-stars" aria-hidden>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`star ${Number(r.rating) >= i ? 'filled gradient' : ''}`}>★</span>
                  ))}
                </div>
                <div style={{ fontWeight:700 }}>{r.patient_name || `Patient ${r.patient_id}`}</div>
                <div style={{ marginTop:6 }}>{r.feedback}</div>
                <div className="rating-meta">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Ratings;
