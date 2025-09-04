const express = require('express');
const router = express.Router();

// Middleware to check if user is a teacher
const requireTeacher = (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.redirect('/login');
    }
    next();
};

// Teacher dashboard
router.get('/dashboard', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get teacher's classes
        const classes = await conn.query(`
            SELECT c.*, COUNT(s.id) as student_count
            FROM class c
            LEFT JOIN student s ON c.id = s.class_id
            WHERE c.teacher_id = ?
            GROUP BY c.id
        `, [req.session.user.teacher_id]);
        
        // Get recent absences for teacher's classes
        const absences = await conn.query(`
            SELECT a.*, s.name as student_name, l.date, l.start_time, l.end_time, l.subject
            FROM absence a
            JOIN student s ON a.student_id = s.id
            JOIN lesson l ON a.lesson_id = l.id
            JOIN class c ON s.class_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY l.date DESC, l.start_time DESC
            LIMIT 10
        `, [req.session.user.teacher_id]);
        
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
        
        res.render('teacher/dashboard', {
            user: req.session.user,
            classes: classes,
            absences: absences,
            messages: messages
        });
        
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.render('error', { error: 'Virhe dashboardin lataamisessa' });
    }
});

// All schedules view
router.get('/schedules', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        const schedules = await conn.query(`
            SELECT l.id, l.subject, l.date, l.start_time, l.end_time, l.teacher_id, l.class_id, t.name as teacher_name
            FROM lesson l
            JOIN teacher t ON l.teacher_id = t.id
            JOIN class c ON l.class_id = c.id
            ORDER BY l.date, l.start_time
        `);
        
        conn.release();
        
        res.render('teacher/schedules', {
            user: req.session.user,
            schedules: schedules
        });
        
    } catch (error) {
        console.error('Teacher schedules error:', error);
        res.render('error', { error: 'Virhe lukujärjestysten lataamisessa' });
    }
});

// Add schedule
router.get('/schedule/add', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        const classes = await conn.query('SELECT * FROM class');
        const teachers = await conn.query('SELECT * FROM teacher');
        
        conn.release();
        
        res.render('teacher/add-schedule', {
            user: req.session.user,
            classes: classes,
            teachers: teachers
        });
        
    } catch (error) {
        console.error('Add schedule error:', error);
        res.render('error', { error: 'Virhe lukujärjestyksen lisäämisessä' });
    }
});

// Process schedule addition
router.post('/schedule/add', requireTeacher, async (req, res) => {
    try {
        const { date, start_time, end_time, subject, class_id, teacher_id } = req.body;
        
        if (!date || !start_time || !end_time || !subject || !class_id || !teacher_id) {
            return res.render('teacher/add-schedule', {
                user: req.session.user,
                error: 'Kaikki kentät ovat pakollisia'
            });
        }
        
        const conn = await req.db.getConnection();
        
        await conn.query(
            'INSERT INTO lesson (date, start_time, end_time, subject, teacher_id, class_id) VALUES (?, ?, ?, ?, ?, ?)',
            [date, start_time, end_time, subject, teacher_id, class_id]
        );
        
        conn.release();
        
        res.redirect('/teacher/schedules');
        
    } catch (error) {
        console.error('Add schedule error:', error);
        res.render('error', { error: 'Virhe lukujärjestyksen lisäämisessä' });
    }
});

// Absences view
router.get('/absences', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        const absences = await conn.query(`
            SELECT a.id, a.student_id, a.lesson_id, a.type, a.reason, a.created_at, s.name as student_name, s.class_id, l.date, l.start_time, l.end_time, l.subject
            FROM absence a
            JOIN student s ON a.student_id = s.id
            JOIN lesson l ON a.lesson_id = l.id
            JOIN class c ON s.class_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY l.date DESC, l.start_time DESC
        `, [req.session.user.teacher_id]);
        
        conn.release();
        
        res.render('teacher/absences', {
            user: req.session.user,
            absences: absences
        });
        
    } catch (error) {
        console.error('Teacher absences error:', error);
        res.render('error', { error: 'Virhe poissaolojen lataamisessa' });
    }
});

// Add absence
router.get('/absence/add', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get students from teacher's classes
        const students = await conn.query(`
            SELECT s.id, s.name, s.email, s.class_id
            FROM student s
            JOIN class c ON s.class_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY s.name
        `, [req.session.user.teacher_id]);
        
        // Get lessons for teacher's classes
        const lessons = await conn.query(`
            SELECT l.id, l.subject, l.date, l.start_time, l.end_time, l.teacher_id, l.class_id
            FROM lesson l
            JOIN class c ON l.class_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY l.date DESC, l.start_time DESC
        `, [req.session.user.teacher_id]);
        
        conn.release();
        
        res.render('teacher/add-absence', {
            user: req.session.user,
            students: students,
            lessons: lessons
        });
        
    } catch (error) {
        console.error('Add absence error:', error);
        res.render('error', { error: 'Virhe poissaolon lisäämisessä' });
    }
});

// Process absence addition
router.post('/absence/add', requireTeacher, async (req, res) => {
    try {
        const { lesson_id, student_id, type, reason } = req.body;
        
        if (!lesson_id || !student_id || !type) {
            return res.render('teacher/add-absence', {
                user: req.session.user,
                error: 'Oppitunti, oppilas ja tyyppi ovat pakollisia'
            });
        }
        
        const conn = await req.db.getConnection();
        
        await conn.query(
            'INSERT INTO absence (lesson_id, student_id, type, reason) VALUES (?, ?, ?, ?)',
            [lesson_id, student_id, type, reason || null]
        );
        
        conn.release();
        
        res.redirect('/teacher/absences');
        
    } catch (error) {
        console.error('Add absence error:', error);
        res.render('error', { error: 'Virhe poissaolon lisäämisessä' });
    }
});

// Update absence type
router.post('/absence/:id/update', requireTeacher, async (req, res) => {
    try {
        const { type, reason } = req.body;
        
        const conn = await req.db.getConnection();
        
        await conn.query(
            'UPDATE absence SET type = ?, reason = ? WHERE id = ?',
            [type, reason || null, req.params.id]
        );
        
        conn.release();
        
        res.redirect('/teacher/absences');
        
    } catch (error) {
        console.error('Update absence error:', error);
        res.render('error', { error: 'Virhe poissaolon päivittämisessä' });
    }
});

// Delete absence
router.post('/absence/:id/delete', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        await conn.query('DELETE FROM absence WHERE id = ?', [req.params.id]);
        
        conn.release();
        
        res.redirect('/teacher/absences');
        
    } catch (error) {
        console.error('Delete absence error:', error);
        res.render('error', { error: 'Virhe poissaolon poistamisessa' });
    }
});

// Teacher messages
router.get('/messages', requireTeacher, async (req, res) => {
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
        
        res.render('teacher/messages', {
            user: req.session.user,
            messages: messages
        });
        
    } catch (error) {
        console.error('Teacher messages error:', error);
        res.render('error', { error: 'Virhe viestien lataamisessa' });
    }
});

// Send message
router.get('/messages/send', requireTeacher, async (req, res) => {
    try {
        const conn = await req.db.getConnection();
        
        // Get students and parents from teacher's classes
        const recipients = await conn.query(`
            SELECT DISTINCT u.email, u.student_id, u.parent_id, s.name as student_name, p.name as parent_name
            FROM user u
            LEFT JOIN student s ON u.student_id = s.id
            LEFT JOIN parent p ON u.parent_id = p.id
            JOIN student_parent_connection spc ON s.id = spc.student_id
            JOIN class c ON s.class_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY s.name, p.name
        `, [req.session.user.teacher_id]);
        
        conn.release();
        
        res.render('teacher/send-message', {
            user: req.session.user,
            recipients: recipients
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        res.render('error', { error: 'Virhe viestin lähettämisessä' });
    }
});

// Process message sending
router.post('/messages/send', requireTeacher, async (req, res) => {
    try {
        const { recipients, subject, body } = req.body;
        
        if (!recipients || !subject || !body) {
            return res.render('teacher/send-message', {
                user: req.session.user,
                error: 'Vastaanottajat, otsikko ja viesti ovat pakollisia'
            });
        }
        
        const conn = await req.db.getConnection();
        
        // Insert message
        const result = await conn.query(
            'INSERT INTO message (sender_email, subject, body) VALUES (?, ?, ?)',
            [req.session.user.email, subject, body]
        );
        
        // Insert message recipients
        const recipientList = Array.isArray(recipients) ? recipients : [recipients];
        for (const recipient of recipientList) {
            await conn.query(
                'INSERT INTO message_to (message_id, recipient_email) VALUES (?, ?)',
                [result.insertId, recipient]
            );
        }
        
        conn.release();
        
        res.redirect('/teacher/messages');
        
    } catch (error) {
        console.error('Send message error:', error);
        res.render('error', { error: 'Virhe viestin lähettämisessä' });
    }
});

module.exports = router;
