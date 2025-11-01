-- Drop existing tables if they exist (for development only)
DROP TABLE IF EXISTS ratings_feedback CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) CHECK (role IN ('doctor','patient')) DEFAULT 'patient',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table
CREATE TABLE posts (
  post_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE appointments (
  appointment_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending','confirmed','cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chats table
CREATE TABLE chats (
  chat_id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ratings_feedback table
CREATE TABLE ratings_feedback (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  appointment_id INT REFERENCES appointments(appointment_id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_chats_sender_id ON chats(sender_id);
CREATE INDEX idx_chats_receiver_id ON chats(receiver_id);
CREATE INDEX idx_ratings_doctor_id ON ratings_feedback(doctor_id);

-- Insert sample data for testing
INSERT INTO users (name, email, password, role, is_verified) VALUES
('Dr. Sarah Smith', 'sarah.smith@medimate.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'doctor', TRUE),
('Dr. John Doe', 'john.doe@medimate.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'doctor', TRUE),
('Alice Johnson', 'alice.j@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'patient', TRUE),
('Bob Williams', 'bob.w@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'patient', TRUE);
