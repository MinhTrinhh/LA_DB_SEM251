-- ============================================================================
-- V12: INSERT SAMPLE DATA
-- Insert realistic sample data for testing and demonstration
-- ============================================================================

PRINT 'Inserting sample data...';
GO

-- ============================================================================
-- 1. INSERT USERS (Participants & Organizers)
-- ============================================================================

PRINT 'Inserting users...';

-- Participants (4 users)
-- Password: password123 (BCrypt encoded)
INSERT INTO [user] (email_address, password, status, failed_login_attempts) VALUES
('nguyen.van.a@gmail.com', '$2a$10$bkmN2U/5PwXi0WtBJxCKM.E.txI6A9yOUPd53UsPUC6l8OJR.Zo4a', 'AUTHENTICATED', 0),
('tran.thi.b@gmail.com', '$2a$10$bkmN2U/5PwXi0WtBJxCKM.E.txI6A9yOUPd53UsPUC6l8OJR.Zo4a', 'AUTHENTICATED', 0),
('le.minh.c@gmail.com', '$2a$10$bkmN2U/5PwXi0WtBJxCKM.E.txI6A9yOUPd53UsPUC6l8OJR.Zo4a', 'AUTHENTICATED', 0),
('pham.thu.d@gmail.com', '$2a$10$bkmN2U/5PwXi0WtBJxCKM.E.txI6A9yOUPd53UsPUC6l8OJR.Zo4a', 'AUTHENTICATED', 0);

-- Organizers (4 users)
-- Password: organizer123 (BCrypt encoded)
INSERT INTO [user] (email_address, password, status, failed_login_attempts) VALUES
('contact@saigontech.vn', '$2a$10$IgyVM7zcjgEIbXHjk1rSR.VhjurHib/5V4py8eBU8KJACgqrsxXH6', 'AUTHENTICATED', 0),
('info@musicvietnam.com', '$2a$10$IgyVM7zcjgEIbXHjk1rSR.VhjurHib/5V4py8eBU8KJACgqrsxXH6', 'AUTHENTICATED', 0),
('admin@hcmutevents.edu.vn', '$2a$10$IgyVM7zcjgEIbXHjk1rSR.VhjurHib/5V4py8eBU8KJACgqrsxXH6', 'AUTHENTICATED', 0),
('events@sportsclub.vn', '$2a$10$IgyVM7zcjgEIbXHjk1rSR.VhjurHib/5V4py8eBU8KJACgqrsxXH6', 'AUTHENTICATED', 0);

GO

-- ============================================================================
-- 2. INSERT USER ROLES
-- ============================================================================

PRINT 'Inserting user roles...';

-- Participant roles
INSERT INTO user_role (user_id, role) VALUES
(1, 'ROLE_PARTICIPANT'),
(2, 'ROLE_PARTICIPANT'),
(3, 'ROLE_PARTICIPANT'),
(4, 'ROLE_PARTICIPANT');

-- Organizer roles (organizers also have participant role to buy tickets)
INSERT INTO user_role (user_id, role) VALUES
(5, 'ROLE_ORGANIZER'),
(5, 'ROLE_PARTICIPANT'),
(6, 'ROLE_ORGANIZER'),
(6, 'ROLE_PARTICIPANT'),
(7, 'ROLE_ORGANIZER'),
(7, 'ROLE_PARTICIPANT'),
(8, 'ROLE_ORGANIZER'),
(8, 'ROLE_PARTICIPANT');

GO

-- ============================================================================
-- 3. INSERT PARTICIPANT PROFILES
-- ============================================================================

PRINT 'Inserting participant profiles...';

INSERT INTO participant_profile (user_id, full_name, phone_number, date_of_birth) VALUES
(1, N'Nguyen Van An', '0901234567', '1995-03-15'),
(2, N'Tran Thi Binh', '0912345678', '1998-07-22'),
(3, N'Le Minh Chien', '0923456789', '1997-11-08'),
(4, N'Pham Thu Dao', '0934567890', '1999-05-20');

GO

-- ============================================================================
-- 4. INSERT ORGANIZER PROFILES
-- ============================================================================

PRINT 'Inserting organizer profiles...';

INSERT INTO organizer_profile (user_id, official_name, tax_id, logo_url, status) VALUES
(5, N'Saigon Tech Hub Co., Ltd.', '0123456789', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400', 'VERIFIED'),
(6, N'Vietnam Music Entertainment JSC', '0987654321', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 'VERIFIED'),
(7, N'HCMUT Student Affairs Office', '0112233445', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400', 'VERIFIED'),
(8, N'Saigon Sports & Fitness Club', '0998877665', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', 'VERIFIED');

GO

-- ============================================================================
-- 5. INSERT EVENTS (Mix of event types in HCMC)
-- ============================================================================

PRINT 'Inserting events...';

INSERT INTO event (title, general_introduction, event_status, organizer_id, start_date_time, end_date_time, poster_url) VALUES
-- Event 1: Tech Conference
(N'Saigon Tech Summit 2025',
 N'The biggest technology conference of 2025 in Ho Chi Minh City featuring top experts in AI, Cloud Computing, and Blockchain. Venue: SECC Saigon Exhibition & Convention Center, District 7.',
 'COMING_SOON',
 5,
 '2026-03-15 08:00:00',
 '2026-03-15 18:00:00',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'),

-- Event 2: Music Concert
(N'Vpop Live Concert - Saigon Night',
 N'Vpop music night featuring Vietnam''s top artists. Energetic music atmosphere in the heart of Saigon. Venue: Phu Tho Indoor Stadium, District 11.',
 'COMING_SOON',
 6,
 '2026-02-20 19:00:00',
 '2026-02-20 22:30:00',
 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'),

-- Event 3: University Workshop
(N'Workshop: Introduction to AI & Machine Learning',
 N'Hands-on workshop on AI and Machine Learning for students. Learn how to build your first ML model. Venue: Ho Chi Minh City University of Technology (Online).',
 'COMING_SOON',
 7,
 '2026-01-25 14:00:00',
 '2026-01-25 17:00:00',
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'),

-- Event 4: Startup Meetup
(N'Saigon Startup Meetup #15',
 N'Meet and connect with the Saigon startup community. Share experiences, find partners and investors. Venue: The Coffee House Signature, Nguyen Hue Street, District 1.',
 'COMING_SOON',
 5,
 '2026-02-10 18:00:00',
 '2026-02-10 21:00:00',
 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800'),

-- Event 5: Food Festival
(N'Saigon Food Festival 2025',
 N'Discover specialties from all three regions of Vietnam in the heart of Saigon. Over 100 food stalls, art performances and many exciting activities. Venue: Tao Dan Park, District 1.',
 'COMING_SOON',
 6,
 '2026-03-08 10:00:00',
 '2026-03-08 20:00:00',
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),

-- Event 6: Marathon
(N'Saigon International Marathon 2026',
 N'Saigon International Marathon with distances: 5km, 10km, 21km, 42km. Start and finish at Landmark 81. Register early for discounts!',
 'COMING_SOON',
 5,
 '2026-04-06 05:00:00',
 '2026-04-06 12:00:00',
 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800'),

-- Event 7: Yoga & Meditation Retreat
(N'Wellness Weekend: Yoga & Meditation by the River',
 N'Rejuvenate your mind and body with a weekend of yoga, meditation, and wellness activities along the Saigon River. Suitable for all levels. Venue: Saigon Sports Club, District 2.',
 'COMING_SOON',
 8,
 '2026-05-16 06:00:00',
 '2026-05-17 18:00:00',
 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800');

GO

-- ============================================================================
-- 6. INSERT EVENT REGULATIONS
-- ============================================================================

PRINT 'Inserting event regulations...';

-- Regulations for Event 1 (Tech Summit)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(1, N'Professional attire recommended'),
(1, N'Bring business cards for networking'),
(1, N'Photography allowed without flash');

-- Regulations for Event 2 (Concert)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(2, N'No flammable objects or weapons allowed'),
(2, N'Children under 6 must be accompanied by an adult'),
(2, N'No smoking inside the venue');

-- Regulations for Event 3 (Workshop)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(3, N'Bring your personal laptop'),
(3, N'Pre-install Python 3.8+ and Jupyter Notebook'),
(3, N'Arrive on time to not miss the introduction');

-- Regulations for Event 7 (Yoga Retreat)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(7, N'Wear comfortable workout clothing'),
(7, N'Bring your own yoga mat if possible'),
(7, N'Stay hydrated throughout the sessions');

GO

-- ============================================================================
-- 7. INSERT SESSIONS
-- ============================================================================

PRINT 'Inserting sessions...';

-- Event 1: Tech Summit - 2 sessions (Morning & Afternoon)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(1, '2026-03-15 08:00:00', '2026-03-15 12:00:00', 500, 'OFFLINE'),
(1, '2026-03-15 13:00:00', '2026-03-15 18:00:00', 500, 'OFFLINE');

-- Event 2: Concert - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(2, '2026-02-20 19:00:00', '2026-02-20 22:30:00', 3000, 'OFFLINE');

-- Event 3: Workshop - 1 session (Online)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(3, '2026-01-25 14:00:00', '2026-01-25 17:00:00', 80, 'ONLINE');

-- Event 4: Startup Meetup - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(4, '2026-02-10 18:00:00', '2026-02-10 21:00:00', 100, 'OFFLINE');

-- Event 5: Food Festival - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(5, '2026-03-08 10:00:00', '2026-03-08 20:00:00', 5000, 'OFFLINE');

-- Event 6: Marathon - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(6, '2026-04-06 05:00:00', '2026-04-06 12:00:00', 3000, 'OFFLINE');

-- Event 7: Yoga Retreat - 2 sessions (Day 1 & Day 2)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(7, '2026-05-16 06:00:00', '2026-05-16 18:00:00', 150, 'OFFLINE'),
(7, '2026-05-17 06:00:00', '2026-05-17 18:00:00', 150, 'OFFLINE');

GO

-- ============================================================================
-- 8. INSERT ONLINE SESSION DETAILS
-- ============================================================================

PRINT 'Inserting online session details...';

-- Event 3: Workshop (Online via Zoom)
INSERT INTO online_session (session_id, event_id, meeting_url, platform_name) VALUES
(4, 3, 'https://zoom.us/j/1234567890?pwd=abcdef123456', 'Zoom');

GO

-- ============================================================================
-- 9. INSERT OFFLINE SESSION DETAILS
-- ============================================================================

PRINT 'Inserting offline session details...';

-- Event 1: Tech Summit - Both sessions
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(1, 1, N'SECC - Saigon Exhibition & Convention Center', N'799 Nguyen Van Linh, Tan Phu Ward, District 7, Ho Chi Minh City'),
(2, 1, N'SECC - Saigon Exhibition & Convention Center', N'799 Nguyen Van Linh, Tan Phu Ward, District 7, Ho Chi Minh City');

-- Event 2: Concert
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(3, 2, N'Phu Tho Indoor Stadium', N'01 Lac Long Quan, Ward 10, District 11, Ho Chi Minh City');

-- Event 4: Startup Meetup
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(5, 4, N'The Coffee House Signature', N'Nguyen Hue Walking Street, Ben Nghe Ward, District 1, Ho Chi Minh City');

-- Event 5: Food Festival
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(6, 5, N'Tao Dan Park', N'Truong Dinh, Ward 6, District 3, Ho Chi Minh City');

-- Event 6: Marathon
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(7, 6, N'Landmark 81', N'208 Nguyen Huu Canh, Vinhomes Tan Cang, Binh Thanh District, Ho Chi Minh City');

-- Event 7: Yoga Retreat - Both days
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(8, 7, N'Saigon Sports & Fitness Club', N'Riverside Campus, Thao Dien Ward, District 2, Ho Chi Minh City'),
(9, 7, N'Saigon Sports & Fitness Club', N'Riverside Campus, Thao Dien Ward, District 2, Ho Chi Minh City');

GO

-- ============================================================================
-- 10. INSERT SEAT MAPS
-- ============================================================================

PRINT 'Inserting seat maps...';

INSERT INTO seat_map (seat_map_url) VALUES
('https://example.com/seatmaps/phu-tho-stadium.png'),  -- Concert
('https://example.com/seatmaps/secc-hall.png'),        -- Tech Summit
('https://example.com/seatmaps/landmark81-start.png'), -- Marathon
('https://example.com/seatmaps/yoga-retreat-layout.png'); -- Yoga Retreat

GO

-- ============================================================================
-- 11. INSERT SEATS
-- ============================================================================

PRINT 'Inserting seats...';

INSERT INTO seat (seat_id, seat_map_id, section_number, row_number, seat_number) VALUES
(1, 1, 'A', '1', '1'),
(2, 1, 'A', '1', '2'),
(3, 1, 'A', '1', '3'),
(4, 1, 'B', '1', '1'),
(5, 1, 'B', '1', '2'),
(6, 1, 'VIP', '1', '1'),
(7, 4, 'Zone-A', '1', '1'),
(8, 4, 'Zone-A', '1', '2');

GO

-- ============================================================================
-- 12. INSERT USE (Session-SeatMap relationships)
-- ============================================================================

PRINT 'Inserting session-seatmap relationships...';

INSERT INTO [use] (session_id, event_id, seat_map_id) VALUES
(3, 2, 1),  -- Concert
(1, 1, 2),  -- Tech Summit morning
(2, 1, 2),  -- Tech Summit afternoon
(7, 6, 3),  -- Marathon
(8, 7, 4),  -- Yoga Retreat Day 1
(9, 7, 4);  -- Yoga Retreat Day 2

GO

-- ============================================================================
-- 13. INSERT TICKET CATEGORIES
-- ============================================================================

PRINT 'Inserting ticket categories...';

-- Event 1: Tech Summit Morning
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'General Admission - Morning', 500000, 300, '2025-12-15 00:00:00', '2026-03-14 23:59:59', 1, 1),
(N'VIP - Morning', 1500000, 100, '2025-12-15 00:00:00', '2026-03-14 23:59:59', 1, 1),
(N'Student - Morning', 200000, 100, '2025-12-15 00:00:00', '2026-03-14 23:59:59', 1, 1);

-- Event 1: Tech Summit Afternoon
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'General Admission - Afternoon', 500000, 300, '2025-12-15 00:00:00', '2026-03-14 23:59:59', 2, 1),
(N'VIP - Afternoon', 1500000, 100, '2025-12-15 00:00:00', '2026-03-14 23:59:59', 2, 1),
(N'Student - Afternoon', 200000, 100, '2025-12-15 00:00:00', '2026-03-14 23:59:59', 2, 1);

-- Event 2: Concert
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Standing Zone', 800000, 1000, '2025-12-10 00:00:00', '2026-02-19 23:59:59', 3, 2),
(N'Seated - Zone A', 1200000, 500, '2025-12-10 00:00:00', '2026-02-19 23:59:59', 3, 2),
(N'VIP Zone', 2500000, 200, '2025-12-10 00:00:00', '2026-02-19 23:59:59', 3, 2);

-- Event 3: Workshop
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Free Admission', 0, 80, '2026-01-01 00:00:00', '2026-01-24 23:59:59', 4, 3);

-- Event 4: Startup Meetup
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'General Entry', 100000, 100, '2026-01-01 00:00:00', '2026-02-09 23:59:59', 5, 4);

-- Event 5: Food Festival
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Entry Ticket', 50000, 5000, '2026-01-01 00:00:00', '2026-03-07 23:59:59', 6, 5);

-- Event 6: Marathon
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'5KM Run', 300000, 1000, '2025-12-10 00:00:00', '2026-04-05 23:59:59', 7, 6),
(N'10KM Run', 400000, 800, '2025-12-10 00:00:00', '2026-04-05 23:59:59', 7, 6),
(N'Half Marathon 21KM', 600000, 600, '2025-12-10 00:00:00', '2026-04-05 23:59:59', 7, 6),
(N'Full Marathon 42KM', 800000, 600, '2025-12-10 00:00:00', '2026-04-05 23:59:59', 7, 6);

-- Event 7: Yoga Retreat - Day 1
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Weekend Pass (2 Days)', 1200000, 100, '2025-12-20 00:00:00', '2026-05-15 23:59:59', 8, 7),
(N'Day 1 Only', 700000, 50, '2025-12-20 00:00:00', '2026-05-15 23:59:59', 8, 7);

-- Event 7: Yoga Retreat - Day 2
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Day 2 Only', 700000, 50, '2025-12-20 00:00:00', '2026-05-16 23:59:59', 9, 7);

GO

-- ============================================================================
-- 14. INSERT AGREEMENT TERMS
-- ============================================================================

PRINT 'Inserting agreement terms...';

-- VIP ticket (Tech Summit Morning - Category ID 2)
INSERT INTO agreement_term (ticket_category_id, aterm) VALUES
(2, N'Tickets are non-refundable under any circumstances'),
(2, N'Please keep your ticket and QR code for check-in'),
(2, N'Access to VIP Lounge included');

-- Concert VIP Zone (Category ID 9)
INSERT INTO agreement_term (ticket_category_id, aterm) VALUES
(9, N'VIP guests receive complimentary drinks'),
(9, N'Priority entrance through dedicated VIP gate'),
(9, N'Must comply with organizer''s security regulations');

-- Marathon Full 42KM (Category ID 16)
INSERT INTO agreement_term (ticket_category_id, aterm) VALUES
(16, N'Participants must be physically fit to run 42KM'),
(16, N'The organizer is not responsible for personal health issues'),
(16, N'Included: Race bib, finisher shirt, and medal');

-- Yoga Retreat Weekend Pass (Category ID 17)
INSERT INTO agreement_term (ticket_category_id, aterm) VALUES
(17, N'Includes all sessions, meals, and yoga mat rental'),
(17, N'Cancelation allowed up to 7 days before event'),
(17, N'Suitable for all levels from beginner to advanced');

GO

-- ============================================================================
-- 15. INSERT ORDERS
-- ============================================================================

PRINT 'Inserting orders...';

INSERT INTO [order] (order_status, currency, amount_of_money, user_id, created_at, updated_at) VALUES
('AWAITING_PAYMENT', 'VND', 500000, 1, '2024-12-01 10:30:00', '2024-12-01 10:30:00'),
('AWAITING_PAYMENT', 'VND', 1600000, 1, '2024-12-05 14:20:00', '2024-12-05 14:20:00'),
('PAID', 'VND', 2500000, 2, '2024-12-03 16:45:00', '2024-12-03 16:45:00'),
('AWAITING_PAYMENT', 'VND', 1200000, 4, '2024-12-04 15:30:00', '2024-12-04 15:30:00');

GO

-- ============================================================================
-- 16. INSERT TICKETS
-- ============================================================================

PRINT 'Inserting tickets...';

INSERT INTO ticket (qr_code_url, used_flag, category_id, order_id, created_at) VALUES
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-001-A1&size=300x300', 0, 1, 1, '2024-12-01 10:30:15'),
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-002-C1&size=300x300', 0, 7, 2, '2024-12-05 14:20:30'),
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-002-C2&size=300x300', 0, 7, 2, '2024-12-05 14:20:31'),
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-003-VIP1&size=300x300', 0, 9, 3, '2024-12-03 16:45:45'),
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-004-YOGA1&size=300x300', 0, 17, 4, '2024-12-04 15:30:45');

GO

-- ============================================================================
-- 17. INSERT PAYMENT METHODS
-- ============================================================================

PRINT 'Inserting payment methods...';

-- Payment Methods 1-3: Banks
-- Payment Methods 4-6: E-wallets
INSERT INTO payment_method (charged_fee, fee_payer) VALUES
(0.00, 'ORGANIZER'),   -- Method 1: Bank (Vietcombank)
(0.00, 'ORGANIZER'),   -- Method 2: Bank (Techcombank)
(0.00, 'ORGANIZER'),   -- Method 3: Bank (BIDV)
(2.50, 'PARTICIPANT'), -- Method 4: E-wallet (MoMo)
(2.50, 'PARTICIPANT'), -- Method 5: E-wallet (ZaloPay)
(2.50, 'PARTICIPANT'); -- Method 6: E-wallet (VNPay)

GO

-- ============================================================================
-- 18. INSERT BANKS AND E-WALLETS
-- ============================================================================

PRINT 'Inserting banks and e-wallets...';

INSERT INTO bank (bank_id, bank_name, method_id) VALUES
(1, N'Vietcombank', 1),
(2, N'Techcombank', 2),
(3, N'BIDV', 3);

INSERT INTO e_wallet (e_wallet_id, e_wallet_name, method_id) VALUES
(1, N'MoMo', 4),
(2, N'ZaloPay', 5),
(3, N'VNPay', 6);

GO

-- ============================================================================
-- 19. INSERT PAID_BY (Payment transactions)
-- ============================================================================

PRINT 'Inserting payment transactions...';

INSERT INTO paid_by (order_id, method_id, qr_code_url, timestamp) VALUES
(1, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-001-MOMO&size=300x300', '2024-12-01 10:31:00'),      -- MoMo
(2, 1, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-002-BANK&size=300x300', '2024-12-05 14:21:00'),      -- Vietcombank
(3, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-003-VNPAY&size=300x300', '2024-12-03 16:46:00'),     -- VNPay
(4, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-004-ZALOPAY&size=300x300', '2024-12-04 15:31:00');  -- ZaloPay

GO

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

PRINT '';
PRINT '============================================================================';
PRINT 'DATA INSERTION COMPLETED SUCCESSFULLY';
PRINT '============================================================================';
PRINT '';
PRINT 'Verification Summary:';
PRINT '';

SELECT * FROM (
    SELECT 'Users' AS TableName, COUNT(*) AS [RowCount] FROM [user]
    UNION ALL SELECT 'User Roles', COUNT(*) AS [RowCount] FROM user_role
    UNION ALL SELECT 'Participant Profiles', COUNT(*) FROM participant_profile
    UNION ALL SELECT 'Organizer Profiles', COUNT(*) FROM organizer_profile
    UNION ALL SELECT 'Events', COUNT(*) FROM event
    UNION ALL SELECT 'Event Regulations', COUNT(*) FROM event_regulation
    UNION ALL SELECT 'Sessions', COUNT(*) FROM [session]
    UNION ALL SELECT 'Online Sessions', COUNT(*) FROM online_session
    UNION ALL SELECT 'Offline Sessions', COUNT(*) FROM offline_session
    UNION ALL SELECT 'Seat Maps', COUNT(*) FROM seat_map
    UNION ALL SELECT 'Seats', COUNT(*) FROM seat
    UNION ALL SELECT 'Use (Session-SeatMap)', COUNT(*) FROM [use]
    UNION ALL SELECT 'Ticket Categories', COUNT(*) FROM ticket_category
    UNION ALL SELECT 'Agreement Terms', COUNT(*) FROM agreement_term
    UNION ALL SELECT 'Orders', COUNT(*) FROM [order]
    UNION ALL SELECT 'Tickets', COUNT(*) FROM ticket
    UNION ALL SELECT 'Payment Methods', COUNT(*) FROM payment_method
    UNION ALL SELECT 'Banks', COUNT(*) FROM bank
    UNION ALL SELECT 'E-Wallets', COUNT(*) FROM e_wallet
    UNION ALL SELECT 'Paid By (Transactions)', COUNT(*) FROM paid_by
) AS Summary
ORDER BY TableName;

PRINT '';
PRINT '============================================================================';
PRINT 'Sample Events Created:';
PRINT '1. Saigon Tech Summit 2025 (Conference - SECC, District 7)';
PRINT '2. Vpop Live Concert - Saigon Night (Music - Phu Tho Stadium, District 11)';
PRINT '3. Introduction to AI & Machine Learning Workshop (Online)';
PRINT '4. Saigon Startup Meetup #15 (Networking - District 1)';
PRINT '5. Saigon Food Festival 2025 (Cultural - Tao Dan Park, District 1)';
PRINT '6. Saigon International Marathon 2026 (Sports - Landmark 81, Binh Thanh)';
PRINT '7. Wellness Weekend: Yoga & Meditation (Wellness - Sports Club, District 2)';
PRINT '';
PRINT 'All events are set to COMING_SOON status and located in Ho Chi Minh City';
PRINT '============================================================================';
GO
