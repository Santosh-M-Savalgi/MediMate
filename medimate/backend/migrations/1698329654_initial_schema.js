/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create users table
  pgm.createTable('users', {
    user_id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(100)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    role: {
      type: 'varchar(10)',
      notNull: true,
      default: 'patient',
      check: "role IN ('doctor','patient')"
    },
    is_verified: {
      type: 'boolean',
      notNull: true,
      default: false
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create posts table
  pgm.createTable('posts', {
    post_id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    title: { type: 'varchar(150)', notNull: true },
    description: { type: 'text', notNull: true },
    category: { type: 'varchar(50)' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create comments table
  pgm.createTable('comments', {
    comment_id: 'id',
    post_id: {
      type: 'integer',
      notNull: true,
      references: '"posts"',
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    content: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create appointments table
  pgm.createTable('appointments', {
    appointment_id: 'id',
    patient_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    appointment_date: { type: 'date', notNull: true },
    appointment_time: { type: 'time', notNull: true },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending','confirmed','cancelled')"
    },
    notes: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create chats table
  pgm.createTable('chats', {
    chat_id: 'id',
    patient_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    message: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create ratings_feedback table
  pgm.createTable('ratings_feedback', {
    rating_id: 'id',
    patient_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    rating: {
      type: 'integer',
      notNull: true,
      check: 'rating >= 1 AND rating <= 5'
    },
    feedback: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create indexes for better performance
  pgm.createIndex('users', 'email');
  pgm.createIndex('posts', 'user_id');
  pgm.createIndex('comments', ['post_id', 'doctor_id']);
  pgm.createIndex('appointments', ['patient_id', 'doctor_id', 'appointment_date']);
  pgm.createIndex('chats', ['patient_id', 'doctor_id']);
  pgm.createIndex('ratings_feedback', ['patient_id', 'doctor_id']);
};

exports.down = pgm => {
  // Drop tables in reverse order
  pgm.dropTable('ratings_feedback');
  pgm.dropTable('chats');
  pgm.dropTable('appointments');
  pgm.dropTable('comments');
  pgm.dropTable('posts');
  pgm.dropTable('users');
};