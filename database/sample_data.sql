-- Sample data for development
-- This script generates sample data with dynamic dates:
-- - Previous week (7 days before current week)
-- - Current week (week containing the script execution date)
-- - Next week (7 days after current week)
-- All dates are calculated relative to when the script is run
-- This script can be safely rerun during development as it clears existing data first

USE ereissuvihko;

-- Clear existing sample data in reverse dependency order
DELETE FROM audit_log;
DELETE FROM message;
DELETE FROM absence;
DELETE FROM lesson;
DELETE FROM student_parent;
DELETE FROM student;
DELETE FROM parent;
DELETE FROM class;
DELETE FROM teacher;

-- Insert sample teachers
INSERT INTO teacher (name, phone, email) VALUES
('Anna Virtanen', '040-1234567', 'anna.virtanen@koulu.fi'),
('Matti Koskinen', '040-2345678', 'matti.koskinen@koulu.fi'),
('Liisa Nieminen', '040-3456789', 'liisa.nieminen@koulu.fi'),
('Jukka Mäkinen', '040-4567890', 'jukka.makinen@koulu.fi'),
('Sanna Korhonen', '040-5678901', 'sanna.korhonen@koulu.fi'),
('Pekka Rantanen', '040-6789012', 'pekka.rantanen@koulu.fi');

-- Insert sample classes
INSERT INTO class (id, teacher_id) VALUES
('1A', 1),
('1B', 2),
('2A', 3),
('2B', 4),
('3A', 5),
('3B', 6);

-- Insert sample students
INSERT INTO student (name, dob, address, phone, email, class_id) VALUES
('Ella Virtanen', '2018-03-15', 'Koulukatu 1, 00100 Helsinki', '040-1111111', 'ella.virtanen@oppilas.koulu.fi', '1A'),
('Aapo Koskinen', '2018-07-22', 'Opiskelijankatu 5, 00100 Helsinki', '040-2222222', 'aapo.koskinen@oppilas.koulu.fi', '1A'),
('Emma Nieminen', '2018-11-08', 'Koulukatu 10, 00100 Helsinki', '040-3333333', 'emma.nieminen@oppilas.koulu.fi', '1B'),
('Oliver Mäkinen', '2018-01-30', 'Opiskelijankatu 15, 00100 Helsinki', '040-4444444', 'oliver.makinen@oppilas.koulu.fi', '1B'),
('Aino Korhonen', '2017-05-12', 'Koulukatu 20, 00100 Helsinki', '040-5555555', 'aino.korhonen@oppilas.koulu.fi', '2A'),
('Eetu Rantanen', '2017-09-18', 'Opiskelijankatu 25, 00100 Helsinki', '040-6666666', 'eetu.rantanen@oppilas.koulu.fi', '2A'),
('Sofia Virtanen', '2017-12-03', 'Koulukatu 30, 00100 Helsinki', '040-7777777', 'sofia.virtanen@oppilas.koulu.fi', '2B'),
('Leo Koskinen', '2017-04-25', 'Opiskelijankatu 35, 00100 Helsinki', '040-8888888', 'leo.koskinen@oppilas.koulu.fi', '2B'),
('Luna Nieminen', '2016-08-14', 'Koulukatu 40, 00100 Helsinki', '040-9999999', 'luna.nieminen@oppilas.koulu.fi', '3A'),
('Vilho Mäkinen', '2016-10-07', 'Opiskelijankatu 45, 00100 Helsinki', '040-1010101', 'vilho.makinen@oppilas.koulu.fi', '3A'),
('Iida Korhonen', '2016-02-28', 'Koulukatu 50, 00100 Helsinki', '040-2020202', 'iida.korhonen@oppilas.koulu.fi', '3B'),
('Onni Rantanen', '2016-06-11', 'Opiskelijankatu 55, 00100 Helsinki', '040-3030303', 'onni.rantanen@oppilas.koulu.fi', '3B');

-- Insert sample parents
INSERT INTO parent (name, phone, email) VALUES
('Marja Virtanen', '040-1111111', 'marja.virtanen@example.com'),
('Jari Koskinen', '040-2222222', 'jari.koskinen@example.com'),
('Riikka Nieminen', '040-3333333', 'riikka.nieminen@example.com'),
('Timo Mäkinen', '040-4444444', 'timo.makinen@example.com'),
('Kaisa Korhonen', '040-5555555', 'kaisa.korhonen@example.com'),
('Marko Rantanen', '040-6666666', 'marko.rantanen@example.com'),
('Pirjo Virtanen', '040-7777777', 'pirjo.virtanen@example.com'),
('Antti Koskinen', '040-8888888', 'antti.koskinen@example.com'),
('Sari Nieminen', '040-9999999', 'sari.nieminen@example.com'),
('Heikki Mäkinen', '040-1010101', 'heikki.makinen@example.com'),
('Minna Korhonen', '040-2020202', 'minna.korhonen@example.com'),
('Juha Rantanen', '040-3030303', 'juha.rantanen@example.com');

-- Connect students with parents
INSERT INTO student_parent_connection (student_id, parent_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6),
(7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12);

-- Insert sample lessons for previous, current, and next week
-- Calculate Monday of current week (assuming Monday is start of week)
SET @current_monday = DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY);
SET @prev_monday = DATE_SUB(@current_monday, INTERVAL 7 DAY);
SET @next_monday = DATE_ADD(@current_monday, INTERVAL 7 DAY);

INSERT INTO lesson (date, start_time, end_time, subject, teacher_id, class_id) VALUES
-- PREVIOUS WEEK - Monday lessons
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '08:00', '08:45', 'Matematiikka', 1, '1A'),
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '09:00', '09:45', 'Suomi', 1, '1A'),
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '10:15', '11:00', 'Liikunta', 1, '1A'),
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '11:15', '12:00', 'Käsityö', 1, '1A'),

(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '08:00', '08:45', 'Matematiikka', 2, '1B'),
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '09:00', '09:45', 'Suomi', 2, '1B'),
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '10:15', '11:00', 'Liikunta', 2, '1B'),
(DATE_ADD(@prev_monday, INTERVAL 0 DAY), '11:15', '12:00', 'Käsityö', 2, '1B'),

-- PREVIOUS WEEK - Tuesday lessons
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '08:00', '08:45', 'Suomi', 1, '1A'),
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '09:00', '09:45', 'Matematiikka', 1, '1A'),
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '10:15', '11:00', 'Musiikki', 1, '1A'),
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '11:15', '12:00', 'Ympäristöoppi', 1, '1A'),

(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '08:00', '08:45', 'Suomi', 2, '1B'),
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '09:00', '09:45', 'Matematiikka', 2, '1B'),
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '10:15', '11:00', 'Musiikki', 2, '1B'),
(DATE_ADD(@prev_monday, INTERVAL 1 DAY), '11:15', '12:00', 'Ympäristöoppi', 2, '1B'),

-- CURRENT WEEK - Monday lessons
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '08:00', '08:45', 'Matematiikka', 1, '1A'),
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '09:00', '09:45', 'Suomi', 1, '1A'),
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '10:15', '11:00', 'Liikunta', 1, '1A'),
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '11:15', '12:00', 'Käsityö', 1, '1A'),

(DATE_ADD(@current_monday, INTERVAL 0 DAY), '08:00', '08:45', 'Matematiikka', 2, '1B'),
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '09:00', '09:45', 'Suomi', 2, '1B'),
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '10:15', '11:00', 'Liikunta', 2, '1B'),
(DATE_ADD(@current_monday, INTERVAL 0 DAY), '11:15', '12:00', 'Käsityö', 2, '1B'),

-- CURRENT WEEK - Tuesday lessons
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '08:00', '08:45', 'Suomi', 1, '1A'),
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '09:00', '09:45', 'Matematiikka', 1, '1A'),
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '10:15', '11:00', 'Musiikki', 1, '1A'),
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '11:15', '12:00', 'Ympäristöoppi', 1, '1A'),

(DATE_ADD(@current_monday, INTERVAL 1 DAY), '08:00', '08:45', 'Suomi', 2, '1B'),
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '09:00', '09:45', 'Matematiikka', 2, '1B'),
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '10:15', '11:00', 'Musiikki', 2, '1B'),
(DATE_ADD(@current_monday, INTERVAL 1 DAY), '11:15', '12:00', 'Ympäristöoppi', 2, '1B'),

-- NEXT WEEK - Monday lessons
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '08:00', '08:45', 'Matematiikka', 1, '1A'),
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '09:00', '09:45', 'Suomi', 1, '1A'),
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '10:15', '11:00', 'Liikunta', 1, '1A'),
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '11:15', '12:00', 'Käsityö', 1, '1A'),

(DATE_ADD(@next_monday, INTERVAL 0 DAY), '08:00', '08:45', 'Matematiikka', 2, '1B'),
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '09:00', '09:45', 'Suomi', 2, '1B'),
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '10:15', '11:00', 'Liikunta', 2, '1B'),
(DATE_ADD(@next_monday, INTERVAL 0 DAY), '11:15', '12:00', 'Käsityö', 2, '1B'),

-- NEXT WEEK - Tuesday lessons
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '08:00', '08:45', 'Suomi', 1, '1A'),
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '09:00', '09:45', 'Matematiikka', 1, '1A'),
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '10:15', '11:00', 'Musiikki', 1, '1A'),
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '11:15', '12:00', 'Ympäristöoppi', 1, '1A'),

(DATE_ADD(@next_monday, INTERVAL 1 DAY), '08:00', '08:45', 'Suomi', 2, '1B'),
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '09:00', '09:45', 'Matematiikka', 2, '1B'),
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '10:15', '11:00', 'Musiikki', 2, '1B'),
(DATE_ADD(@next_monday, INTERVAL 1 DAY), '11:15', '12:00', 'Ympäristöoppi', 2, '1B');

-- Insert sample absences (using lesson IDs from current week)
-- Get the first lesson ID from current week Monday for class 1A
SET @lesson1_id = (SELECT id FROM lesson WHERE date = DATE_ADD(@current_monday, INTERVAL 0 DAY) AND class_id = '1A' AND start_time = '08:00' LIMIT 1);
-- Get the second lesson ID from current week Monday for class 1A  
SET @lesson2_id = (SELECT id FROM lesson WHERE date = DATE_ADD(@current_monday, INTERVAL 0 DAY) AND class_id = '1A' AND start_time = '09:00' LIMIT 1);
-- Get the first lesson ID from current week Monday for class 1B
SET @lesson3_id = (SELECT id FROM lesson WHERE date = DATE_ADD(@current_monday, INTERVAL 0 DAY) AND class_id = '1B' AND start_time = '08:00' LIMIT 1);

INSERT INTO absence (lesson_id, student_id, type, reason) VALUES
(@lesson1_id, 1, 'unclear', NULL),
(@lesson2_id, 3, 'with_permission', 'Lääkärikäynti'),
(@lesson3_id, 2, 'without_permission', NULL);

-- Insert users for authentication
INSERT INTO user (email, student_id, teacher_id, parent_id) VALUES
-- Students
('ella.virtanen@example.com', 1, NULL, NULL),
('aapo.koskinen@example.com', 2, NULL, NULL),
('emma.nieminen@example.com', 3, NULL, NULL),
('oliver.makinen@example.com', 4, NULL, NULL),
('aino.korhonen@example.com', 5, NULL, NULL),
('eetu.rantanen@example.com', 6, NULL, NULL),
('sofia.virtanen@example.com', 7, NULL, NULL),
('leo.koskinen@example.com', 8, NULL, NULL),
('luna.nieminen@example.com', 9, NULL, NULL),
('vilho.makinen@example.com', 10, NULL, NULL),
('iida.korhonen@example.com', 11, NULL, NULL),
('onni.rantanen@example.com', 12, NULL, NULL),

-- Teachers
('anna.virtanen@koulu.fi', NULL, 1, NULL),
('matti.koskinen@koulu.fi', NULL, 2, NULL),
('liisa.nieminen@koulu.fi', NULL, 3, NULL),
('jukka.makinen@koulu.fi', NULL, 4, NULL),
('sanna.korhonen@koulu.fi', NULL, 5, NULL),
('pekka.rantanen@koulu.fi', NULL, 6, NULL),

-- Parents
('marja.virtanen@example.com', NULL, NULL, 1),
('jari.koskinen@example.com', NULL, NULL, 2),
('riikka.nieminen@example.com', NULL, NULL, 3),
('timo.makinen@example.com', NULL, NULL, 4),
('kaisa.korhonen@example.com', NULL, NULL, 5),
('marko.rantanen@example.com', NULL, NULL, 6),
('pirjo.virtanen@example.com', NULL, NULL, 7),
('antti.koskinen@example.com', NULL, NULL, 8),
('sari.nieminen@example.com', NULL, NULL, 9),
('heikki.makinen@example.com', NULL, NULL, 10),
('minna.korhonen@example.com', NULL, NULL, 11),
('juha.rantanen@example.com', NULL, NULL, 12);

-- Insert sample messages
INSERT INTO message (sender_email, subject, body) VALUES
('anna.virtanen@koulu.fi', 'Tervetuloa uuteen lukuvuoteen!', 'Rakkaat oppilaat ja huoltajat! Tervetuloa uuteen lukuvuoteen. Olen iloinen, että pääsen opettamaan teitä tänä vuonna.'),
('marja.virtanen@example.com', 'Kysymys matematiikan kotitehtävistä', 'Hei! Minulla on kysymys matematiikan kotitehtävistä. Voitteko auttaa?'),
('ella.virtanen@example.com', 'Kiitos opettajalle', 'Kiitos hyvästä oppitunnista!');

-- Insert message recipients
INSERT INTO message_to (message_id, recipient_email) VALUES
(1, 'ella.virtanen@example.com'),
(1, 'aapo.koskinen@example.com'),
(1, 'marja.virtanen@example.com'),
(1, 'jari.koskinen@example.com'),
(2, 'anna.virtanen@koulu.fi'),
(3, 'anna.virtanen@koulu.fi');
