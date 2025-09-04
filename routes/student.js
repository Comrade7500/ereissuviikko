const express = require('express');
const router = express.Router();

// Middleware to check if user is a student
const requireStudent = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.redirect('/login');
    }
    next();
};

// Student dashboard
router.get('/dashboard', requireStudent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get student's schedule for current week
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
        
        const schedule = await conn.query(`
            SELECT l.*, t.name as teacher_name, c.id as class_id
            FROM lesson l
            JOIN teacher t ON l.teacher_id = t.id
            JOIN class c ON l.class_id = c.id
            WHERE l.class_id = ? AND l.date BETWEEN ? AND ?
            ORDER BY l.date, l.start_time
        `, [req.session.user.class_id, startOfWeek, endOfWeek]);
        
        // Get unread messages
        const messages = await conn.query(`
            SELECT m.*, u.email as sender_email
            FROM message m
            JOIN message_to mt ON m.id = mt.message_id
            JOIN user u ON m.sender_email = u.email
            WHERE mt.recipient_email = ? AND mt.seen_at IS NULL
            ORDER BY m.sent_at DESC
        `, [req.session.user.email]);
        
        conn.release();
        
        res.render('student/dashboard', {
            user: req.session.user,
            schedule: schedule,
            messages: messages
        });
        
    } catch (error) {
        console.error('Student dashboard error:', error);
        res.render('error', { error: 'Virhe dashboardin lataamisessa' });
    }
});

// Student schedule
router.get('/schedule', requireStudent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        const schedule = await conn.query(`
            SELECT l.*, t.name as teacher_name
            FROM lesson l
            JOIN teacher t ON l.teacher_id = t.id
            WHERE l.class_id = ?
            ORDER BY l.date, l.start_time
        `, [req.session.user.class_id]);
        
        conn.release();
        
        res.render('student/schedule', {
            user: req.session.user,
            schedule: schedule
        });
        
    } catch (error) {
        console.error('Student schedule error:', error);
        res.render('error', { error: 'Virhe lukujärjestyksen lataamisessa' });
    }
});

// Student messages
router.get('/messages', requireStudent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        const messages = await conn.query(`
            SELECT m.*, u.email as sender_email, mt.seen_at
            FROM message m
            JOIN message_to mt ON m.id = mt.message_id
            JOIN user u ON m.sender_email = u.email
            WHERE mt.recipient_email = ?
            ORDER BY m.sent_at DESC
        `, [req.session.user.email]);
        
        conn.release();
        
        res.render('student/messages', {
            user: req.session.user,
            messages: messages
        });
        
    } catch (error) {
        console.error('Student messages error:', error);
        res.render('error', { error: 'Virhe viestien lataamisessa' });
    }
});

// Mark message as read
router.post('/messages/:id/read', requireStudent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        await conn.query(
            'UPDATE message_to SET seen_at = NOW() WHERE message_id = ? AND recipient_email = ?',
            [req.params.id, req.session.user.email]
        );
        
        conn.release();
        res.json({ success: true });
        
    } catch (error) {
        console.error('Mark message read error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Send message to teacher
router.get('/messages/send', requireStudent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get student's teachers
        const teachers = await conn.query(`
            SELECT DISTINCT t.*
            FROM teacher t
            JOIN lesson l ON t.id = l.teacher_id
            WHERE l.class_id = ?
        `, [req.session.user.class_id]);
        
        conn.release();
        
        res.render('student/send-message', {
            user: req.session.user,
            teachers: teachers
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        res.render('error', { error: 'Virhe viestin lähettämisessä' });
    }
});

// Process message sending
router.post('/messages/send', requireStudent, async (req, res) => {
    try {
        const { recipient, subject, body } = req.body;
        
        if (!recipient || !subject || !body) {
            return res.render('student/send-message', {
                user: req.session.user,
                error: 'Kaikki kentät ovat pakollisia'
            });
        }
        
        const conn = await req.db.getConnection();
        
        // Insert message
        const result = await conn.query(
            'INSERT INTO message (sender_email, subject, body) VALUES (?, ?, ?)',
            [req.session.user.email, subject, body]
        );
        
        // Insert message recipient
        await conn.query(
            'INSERT INTO message_to (message_id, recipient_email) VALUES (?, ?)',
            [result.insertId, recipient]
        );
        
        conn.release();
        
        res.redirect('/student/messages');
        
    } catch (error) {
        console.error('Send message error:', error);
        res.render('error', { error: 'Virhe viestin lähettämisessä' });
    }
});

module.exports = router;
