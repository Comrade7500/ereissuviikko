const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
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

// Login process (email-based, no password)
router.post('/login', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.render('login', { error: 'Sähköpostiosoite on pakollinen' });
    }
    
    try {
        const conn = await req.db.getConnection();
        
        // Find user by email
        const user = await conn.query(
            'SELECT * FROM user WHERE email = ?',
            [email]
        );
        
        if (user.length === 0) {
            conn.release();
            return res.render('login', { error: 'Käyttäjää ei löytynyt' });
        }
        
        const userData = user[0];
        
        // Get additional user information based on type
        let userInfo = {};
        
        if (userData.student_id) {
            const student = await conn.query(
                'SELECT s.id, s.name, s.email, s.class_id FROM student s LEFT JOIN class c ON s.class_id = c.id WHERE s.id = ?',
                [userData.student_id]
            );
            userInfo = { ...userData, ...student[0], userType: 'student' };
        } else if (userData.teacher_id) {
            const teacher = await conn.query(
                'SELECT * FROM teacher WHERE id = ?',
                [userData.teacher_id]
            );
            userInfo = { ...userData, ...teacher[0], userType: 'teacher' };
        } else if (userData.parent_id) {
            const parent = await conn.query(
                'SELECT * FROM parent WHERE id = ?',
                [userData.parent_id]
            );
            userInfo = { ...userData, ...parent[0], userType: 'parent' };
        }
        
        conn.release();
        
        // Store user in session
        req.session.user = userInfo;
        
        // Redirect based on user type
        if (userInfo.userType === 'student') {
            res.redirect('/student/dashboard');
        } else if (userInfo.userType === 'teacher') {
            res.redirect('/teacher/dashboard');
        } else if (userInfo.userType === 'parent') {
            res.redirect('/parent/dashboard');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Kirjautumisessa tapahtui virhe' });
    }
});

module.exports = router;
