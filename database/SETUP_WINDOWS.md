# Windows Database Setup Guide

This guide provides step-by-step instructions to set up the eReissuvihko database on Windows.

## Prerequisites

- MariaDB or MySQL installed on Windows
- MySQL command line client accessible from PATH, OR
- MySQL Workbench, OR
- phpMyAdmin

## Manual Setup (Recommended)

### Step 1: Create Database User
1. Open MySQL command line or MySQL Workbench
2. Connect as root user
3. Run the following SQL script:
   ```sql
   source database/setup_database_user.sql
   ```
   Or copy and paste the contents of `database/setup_database_user.sql`

### Step 2: Create Database Schema
1. Connect as the new user `ereissuvihko_user` with password `SecureAppPassword2024!`
2. Run:
   ```sql
   source database/create_database.sql
   ```

### Step 3: Insert Sample Data
1. Still connected as `ereissuvihko_user`
2. Run:
   ```sql
   source database/sample_data.sql
   ```

## Alternative: Using MySQL Workbench

### Step 1: Create User
1. Open MySQL Workbench
2. Connect to your MySQL server as root
3. Open `database/setup_database_user.sql`
4. Execute the script

### Step 2: Create Schema
1. Create a new connection with:
   - Username: `ereissuvihko_user`
   - Password: `SecureAppPassword2024!`
   - Database: `ereissuvihko`
2. Open `database/create_database.sql`
3. Execute the script

### Step 3: Insert Data
1. Open `database/sample_data.sql`
2. Execute the script

## Alternative: Using phpMyAdmin

### Step 1: Create User
1. Open phpMyAdmin in your browser
2. Go to "User accounts" tab
3. Click "Add user account"
4. Set:
   - Username: `ereissuvihko_user`
   - Host name: `Local`
   - Password: `SecureAppPassword2024!`
5. In "Database for user account" section:
   - Check "Create database with same name and grant all privileges"
   - Database name: `ereissuvihko`
6. Click "Go"

### Step 2: Create Schema
1. Select the `ereissuvihko` database
2. Go to "SQL" tab
3. Copy and paste contents of `database/create_database.sql`
4. Click "Go"

### Step 3: Insert Data
1. Still in the `ereissuvihko` database
2. Go to "SQL" tab
3. Copy and paste contents of `database/sample_data.sql`
4. Click "Go"

## Verification

After setup, verify everything works:

1. **Test connection:**
   ```cmd
   mysql -u ereissuvihko_user -p"SecureAppPassword2024!" -e "SELECT 1;"
   ```

2. **Check tables:**
   ```cmd
   mysql -u ereissuvihko_user -p"SecureAppPassword2024!" -e "USE ereissuvihko; SHOW TABLES;"
   ```

3. **Check sample data:**
   ```cmd
   mysql -u ereissuvihko_user -p"SecureAppPassword2024!" -e "USE ereissuvihko; SELECT COUNT(*) FROM student;"
   ```

## Environment Configuration

After successful database setup, update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=ereissuvihko_user
DB_PASSWORD=SecureAppPassword2024!
DB_NAME=ereissuvihko
```

## Troubleshooting

### Common Issues:

1. **"mysql command not found"**
   - Add MySQL bin directory to your PATH
   - Or use full path: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

2. **"Access denied for user"**
   - Check if the user was created correctly
   - Verify password is correct
   - Make sure you're connecting to the right host

3. **"Database doesn't exist"**
   - Run the setup_database_user.sql script first
   - Check if the database was created

4. **"Table already exists"**
   - Drop the database and recreate it:
   ```sql
   DROP DATABASE ereissuvihko;
   CREATE DATABASE ereissuvihko;
   ```

### Getting Help:

If you encounter issues:
1. Check the MySQL error logs
2. Verify your MySQL/MariaDB installation
3. Ensure the service is running
4. Check firewall settings if connecting remotely

## Security Notes

- The password `SecureAppPassword2024!` is for development only
- Change it in production
- The application user has limited permissions (only on the ereissuvihko database)
- Consider using SSL connections in production
