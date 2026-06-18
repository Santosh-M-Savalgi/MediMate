import React from 'react';

const functionSQL = `-- Function: update_doctor_avg_rating
CREATE OR REPLACE FUNCTION update_doctor_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET avg_rating = (
    SELECT AVG(rating)
    FROM ratings_feedback
    WHERE doctor_id = NEW.doctor_id
  )
  WHERE user_id = NEW.doctor_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

const triggerSQL = `-- Trigger: call update_doctor_avg_rating after insert or update on ratings_feedback
-- You should create the trigger like this (run in your DB):

CREATE TRIGGER trg_update_avg_rating
AFTER INSERT OR UPDATE ON ratings_feedback
FOR EACH ROW
EXECUTE FUNCTION update_doctor_avg_rating();`;

const queriesSQL = `-- 1. Get all doctors
SELECT user_id, name, email FROM users WHERE role = 'doctor';

-- 2. Get all verified patients
SELECT user_id, name, email FROM users WHERE role = 'patient' AND is_verified = TRUE;

-- 3. Get all posts with user info (from view)
SELECT * FROM post_details ORDER BY post_date DESC;

-- 4. Get comments on a specific post
SELECT c.content, c.created_at, u.name AS doctor_name
FROM comments c JOIN users u ON c.doctor_id = u.user_id
WHERE c.post_id = 1;

-- 5. Get all appointments for a patient
SELECT a.*, d.name AS doctor_name
FROM appointments a JOIN users d ON a.doctor_id = d.user_id
WHERE a.patient_id = 3;

-- 6. Get all confirmed appointments for a doctor
SELECT a.*, p.name AS patient_name
FROM appointments a JOIN users p ON a.patient_id = p.user_id
WHERE a.doctor_id = 1 AND a.status = 'confirmed';

-- 7. Count appointments per doctor
SELECT doctor_id, COUNT(*) AS total_appointments
FROM appointments GROUP BY doctor_id;

-- 8. Update appointment status to confirmed
UPDATE appointments SET status = 'confirmed'
WHERE appointment_id = 2;

-- 9. Get average rating for each doctor
SELECT doctor_id, AVG(rating) AS avg_rating
FROM ratings_feedback GROUP BY doctor_id;

-- 10. Get top 5 highest-rated doctors
SELECT u.user_id, u.name, AVG(r.rating) AS avg_rating
FROM users u JOIN ratings_feedback r ON u.user_id = r.doctor_id
WHERE u.role = 'doctor'
GROUP BY u.user_id, u.name
ORDER BY avg_rating DESC
LIMIT 5;

-- 11. Get feedback comments for a specific doctor
SELECT r.feedback, r.rating, u.name AS patient_name
FROM ratings_feedback r JOIN users u ON r.patient_id = u.user_id
WHERE r.doctor_id = 1;

-- 12. Chat history between two users
SELECT * FROM chats
WHERE (sender_id = 3 AND receiver_id = 1) OR (sender_id = 1 AND receiver_id = 3)
ORDER BY sent_at;

-- 13. Insert a new chat message
INSERT INTO chats (sender_id, receiver_id, message)
VALUES (3, 1, 'Hello doctor, I need guidance.');

-- 14. Latest 10 posts
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;

-- 15. Doctors who never got a rating yet
SELECT u.user_id, u.name
FROM users u
WHERE u.role = 'doctor'
  AND NOT EXISTS (
    SELECT 1 FROM ratings_feedback r WHERE r.doctor_id = u.user_id
  );`;

function CodeBlock({ title, sql }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 8, color: 'var(--landing-title, #fff)' }}>{title}</h3>
      <pre style={{ background: 'rgba(2,6,23,0.72)', color: '#eaf4ff', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
        <code style={{ color: 'inherit', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace', fontSize: 13 }}>{sql}</code>
      </pre>
    </section>
  );
}

export default function SQLQueriesPage() {
  return (
    <div style={{ padding: 20, color: 'var(--landing-text, #eaf4ff)' }}>
      <h1 style={{ color: 'var(--landing-title, #fff)' }}>Database Views, Triggers & Helpers</h1>
      <p style={{ color: 'var(--landing-sub, rgba(234,238,248,0.8))', marginBottom: 16 }}>
        The SQL snippets below were extracted from `backend/schema.sql`. They include the average-rating update function,
        an example trigger to invoke it, and the indexes defined for better query performance. Run these statements
        in your PostgreSQL environment (psql, pgAdmin, etc.) to bring your database in sync.
      </p>

      <CodeBlock title="Function: update_doctor_avg_rating" sql={functionSQL} />

      <CodeBlock title="Trigger to call function after insert/update" sql={triggerSQL} />

      <CodeBlock title="Useful Queries" sql={queriesSQL} />

      <div style={{ marginTop: 12, color: 'var(--landing-sub, rgba(234,238,248,0.8))' }}>
        <strong>Notes:</strong>
        <ul>
          <li>Ensure the <code>users</code> table has an <code>avg_rating</code> numeric column before running the function/trigger.</li>
          <li>The original `schema.sql` included some example INSERT/SELECT statements used for testing; review the file before running any data-modifying queries.</li>
          <li>Triggers must be created by a DB user with proper privileges.</li>
        </ul>
      </div>
    </div>
  );
}
