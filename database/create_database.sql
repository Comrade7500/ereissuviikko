-- Create database for eReissuvihko
-- Note: This script should be run as the ereissuvihko_user after setup_database_user.sql
-- Database and user should already be created by setup_database_user.sql
-- This script can be safely rerun during development as it drops existing tables first

USE ereissuvihko;

-- Drop existing tables in reverse dependency order to avoid foreign key constraints
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS absence;
DROP TABLE IF EXISTS lesson;
DROP TABLE IF EXISTS student_parent;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS parent;
DROP TABLE IF EXISTS class;
DROP TABLE IF EXISTS teacher;

-- Create teacher table
CREATE TABLE teacher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Create class table
CREATE TABLE class (
    id VARCHAR(10) PRIMARY KEY,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE SET NULL
);

-- Create student table
CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    class_id VARCHAR(10),
    FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE SET NULL
);

-- Create parent table
CREATE TABLE parent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Create student_parent_connection table
CREATE TABLE student_parent_connection (
    student_id INT,
    parent_id INT,
    PRIMARY KEY (student_id, parent_id),
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE
);

-- Create lesson table
CREATE TABLE lesson (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    start_time CHAR(5) NOT NULL,
    end_time CHAR(5) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    teacher_id INT NOT NULL,
    class_id VARCHAR(10) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE CASCADE
);

-- Create absence table
CREATE TABLE absence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    student_id INT NOT NULL,
    type ENUM('unclear', 'with_permission', 'without_permission') DEFAULT 'unclear',
    reason TEXT,
    seen_by_parent_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lesson(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- Create user table for authentication
CREATE TABLE user (
    email VARCHAR(255) PRIMARY KEY,
    student_id INT NULL,
    teacher_id INT NULL,
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE,
    CHECK (
        (student_id IS NOT NULL AND teacher_id IS NULL AND parent_id IS NULL) OR
        (student_id IS NULL AND teacher_id IS NOT NULL AND parent_id IS NULL) OR
        (student_id IS NULL AND teacher_id IS NULL AND parent_id IS NOT NULL)
    )
);

-- Create message table
CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_email) REFERENCES user(email) ON DELETE CASCADE
);

-- Create message_to table
CREATE TABLE message_to (
    message_id INT,
    recipient_email VARCHAR(255),
    seen_at DATETIME NULL,
    PRIMARY KEY (message_id, recipient_email),
    FOREIGN KEY (message_id) REFERENCES message(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_email) REFERENCES user(email) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_student_class ON student(class_id);
CREATE INDEX idx_lesson_date ON lesson(date);
CREATE INDEX idx_lesson_class ON lesson(class_id);
CREATE INDEX idx_lesson_teacher ON lesson(teacher_id);
CREATE INDEX idx_absence_lesson ON absence(lesson_id);
CREATE INDEX idx_absence_student ON absence(student_id);
CREATE INDEX idx_absence_date ON absence(created_at);
CREATE INDEX idx_message_sender ON message(sender_email);
CREATE INDEX idx_message_sent_at ON message(sent_at);
CREATE INDEX idx_message_to_recipient ON message_to(recipient_email);
CREATE INDEX idx_user_student ON user(student_id);
CREATE INDEX idx_user_teacher ON user(teacher_id);
CREATE INDEX idx_user_parent ON user(parent_id);
CREATE INDEX idx_user_active ON user(is_active);

-- Create audit log table for security monitoring
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES user(email) ON DELETE SET NULL
);

-- Create index for audit log
CREATE INDEX idx_audit_log_user ON audit_log(user_email);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
