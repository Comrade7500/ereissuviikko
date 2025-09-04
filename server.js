const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ereissuvihko',
    connectionLimit: 5
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));

// Make database pool available to routes
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const parentRoutes = require('./routes/parent');

// Use routes
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/parent', parentRoutes);

// Home page
app.get('/', (req, res) => {
    if (req.session.user) {
        // Redirect based on user type
        if (req.session.user.student_id) {
            res.redirect('/student/dashboard');
        } else if (req.session.user.teacher_id) {
            res.redirect('/teacher/dashboard');
        } else if (req.session.user.parent_id) {
            res.redirect('/parent/dashboard');
        }
    } else {
        res.render('login', { error: null });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.redirect('/');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        error: 'Jotain meni pieleen!',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        error: 'Sivua ei löytynyt',
        message: 'Hakemaasi sivua ei ole olemassa.' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
