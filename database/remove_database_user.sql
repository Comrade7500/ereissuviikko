-- Remove the ereissuvihko_user from the database
-- Run this script as root user: mysql -u root -p < remove_database_user.sql

DROP USER IF EXISTS 'ereissuvihko_user'@'localhost';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Verify the user has been removed
SELECT User, Host FROM mysql.user WHERE User = 'ereissuvihko_user';
