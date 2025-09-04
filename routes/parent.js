const express = require('express');
const router = express.Router();

// Middleware to check if user is a parent
const requireParent = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'parent') {
        return res.redirect('/login');
    }
    next();
};

// Parent dashboard
router.get('/dashboard', requireParent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get parent's children
        const children = await conn.query(`
            SELECT s.id, s.name, s.email, s.class_id, t.name as teacher_name
            FROM student s
            JOIN student_parent_connection spc ON s.id = spc.student_id
            JOIN class c ON s.class_id = c.id
            LEFT JOIN teacher t ON c.teacher_id = t.id
            WHERE spc.parent_id = ?
        `, [req.session.user.parent_id]);
        
        // Get recent absences for children
        const absences = await conn.query(`
            SELECT a.*, s.name as student_name, l.date, l.start_time, l.end_time, l.subject
            FROM absence a
            JOIN student s ON a.student_id = s.id
            JOIN lesson l ON a.lesson_id = l.id
            JOIN student_parent_connection spc ON s.id = spc.student_id
            WHERE spc.parent_id = ?
            ORDER BY l.date DESC, l.start_time DESC
            LIMIT 10
        `, [req.session.user.parent_id]);
        
        // Get unread messages
        const messages = await conn.query(`
            SELECT m.id, m.subject, m.body, m.sent_at, u.email as sender_email
            FROM message m
            JOIN message_to mt ON m.id = mt.message_id
            JOIN user u ON m.sender_email = u.email
            WHERE mt.recipient_email = ? AND mt.seen_at IS NULL
            ORDER BY m.sent_at DESC
        `, [req.session.user.email]);
        
        conn.release();
        
        res.render('parent/dashboard', {
            user: req.session.user,
            children: children,
            absences: absences,
            messages: messages
        });
        
    } catch (error) {
        console.error('Parent dashboard error:', error);
        res.render('error', { error: 'Virhe dashboardin lataamisessa' });
    }
});

// Child's schedule
router.get('/schedule/:childId', requireParent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Verify parent has access to this child
        const hasAccess = await conn.query(`
            SELECT 1 FROM student_parent_connection 
            WHERE student_id = ? AND parent_id = ?
        `, [req.params.childId, req.session.user.parent_id]);
        
        if (hasAccess.length === 0) {
            conn.release();
            return res.render('error', { error: 'Ei oikeutta tähän oppilaaseen' });
        }
        
        // Get child's schedule
        const schedule = await conn.query(`
            SELECT l.id, l.subject, l.date, l.start_time, l.end_time, l.teacher_id, l.class_id, t.name as teacher_name, s.name as student_name
            FROM lesson l
            JOIN teacher t ON l.teacher_id = t.id
            JOIN student s ON l.class_id = s.class_id
            WHERE s.id = ?
            ORDER BY l.date, l.start_time
        `, [req.params.childId]);
        
        conn.release();
        
        res.render('parent/schedule', {
            user: req.session.user,
            schedule: schedule,
            childId: req.params.childId
        });
        
    } catch (error) {
        console.error('Parent schedule error:', error);
        res.render('error', { error: 'Virhe lukujärjestyksen lataamisessa' });
    }
});

// Child's absences
router.get('/absences/:childId', requireParent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Verify parent has access to this child
        const hasAccess = await conn.query(`
            SELECT 1 FROM student_parent_connection 
            WHERE student_id = ? AND parent_id = ?
        `, [req.params.childId, req.session.user.parent_id]);
        
        if (hasAccess.length === 0) {
            conn.release();
            return res.render('error', { error: 'Ei oikeutta tähän oppilaaseen' });
        }
        
        // Get child's absences
        const absences = await conn.query(`
            SELECT a.*, s.name as student_name, l.date, l.start_time, l.end_time, l.subject
            FROM absence a
            JOIN student s ON a.student_id = s.id
            JOIN lesson l ON a.lesson_id = l.id
            WHERE s.id = ?
            ORDER BY l.date DESC, l.start_time DESC
        `, [req.params.childId]);
        
        conn.release();
        
        res.render('parent/absences', {
            user: req.session.user,
            absences: absences,
            childId: req.params.childId
        });
        
    } catch (error) {
        console.error('Parent absences error:', error);
        res.render('error', { error: 'Virhe poissaolojen lataamisessa' });
    }
});

// Acknowledge absence
router.post('/absence/:id/acknowledge', requireParent, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const conn = await req.db.getConnection();
        
        // Verify parent has access to this absence
        const hasAccess = await conn.query(`
            SELECT 1 FROM absence a
            JOIN student_parent_connection spc ON a.student_id = spc.student_id
            WHERE a.id = ? AND spc.parent_id = ?
        `, [req.params.id, req.session.user.parent_id]);
        
        if (hasAccess.length === 0) {
            conn.release();
            return res.json({ success: false, error: 'Ei oikeutta tähän poissaoloon' });
        }
        
        // Update absence
        await conn.query(
            'UPDATE absence SET seen_by_parent_at = NOW(), reason = ? WHERE id = ?',
            [reason || null, req.params.id]
        );
        
        conn.release();
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Acknowledge absence error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Parent messages
router.get('/messages', requireParent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        const messages = await conn.query(`
            SELECT m.id, m.subject, m.body, m.sent_at, u.email as sender_email, mt.seen_at
            FROM message m
            JOIN message_to mt ON m.id = mt.message_id
            JOIN user u ON m.sender_email = u.email
            WHERE mt.recipient_email = ?
            ORDER BY m.sent_at DESC
        `, [req.session.user.email]);
        
        conn.release();
        
        res.render('parent/messages', {
            user: req.session.user,
            messages: messages
        });
        
    } catch (error) {
        console.error('Parent messages error:', error);
        res.render('error', { error: 'Virhe viestien lataamisessa' });
    }
});

// Mark message as read
router.post('/messages/:id/read', requireParent, async (req, res) => {
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
router.get('/messages/send', requireParent, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get teachers of parent's children
        const teachers = await conn.query(`
            SELECT DISTINCT t.*
            FROM teacher t
            JOIN class c ON t.id = c.teacher_id
            JOIN student s ON c.id = s.class_id
            JOIN student_parent_connection spc ON s.id = spc.student_id
            WHERE spc.parent_id = ?
        `, [req.session.user.parent_id]);
        
        conn.release();
        
        res.render('parent/send-message', {
            user: req.session.user,
            teachers: teachers
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        res.render('error', { error: 'Virhe viestin lähettämisessä' });
    }
});

// Process message sending
router.post('/messages/send', requireParent, async (req, res) => {
    try {
        const { recipient, subject, body } = req.body;
        
        if (!recipient || !subject || !body) {
            return res.render('parent/send-message', {
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
        
        res.redirect('/parent/messages');
        
    } catch (error) {
        console.error('Send message error:', error);
        res.render('error', { error: 'Virhe viestin lähettämisessä' });
    }
});

module.exports = router;
