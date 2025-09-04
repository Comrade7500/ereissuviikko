-- Database setup script with security improvements
-- Run this as root user to create the application database user

-- Create dedicated database user for the application
CREATE USER IF NOT EXISTS 'ereissuvihko_user'@'localhost' IDENTIFIED BY 'SecureAppPassword2025!';

-- Create the database
CREATE DATABASE IF NOT EXISTS ereissuvihko CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant necessary permissions to the application user
-- Only grant permissions on the specific database, not globally
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON ereissuvihko.* TO 'ereissuvihko_user'@'localhost';

-- Grant permission to create temporary tables (needed for some operations)
GRANT CREATE TEMPORARY TABLES ON ereissuvihko.* TO 'ereissuvihko_user'@'localhost';

-- Grant permission to lock tables (needed for some operations)
GRANT LOCK TABLES ON ereissuvihko.* TO 'ereissuvihko_user'@'localhost';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Show the created user and permissions
SELECT User, Host FROM mysql.user WHERE User = 'ereissuvihko_user';
SHOW GRANTS FOR 'ereissuvihko_user'@'localhost';

-- Display success message
SELECT 'Database user created successfully!' as Status;
