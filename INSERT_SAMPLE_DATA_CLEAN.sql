/*
============================================================================
  EVENT-EASE DATABASE - SAMPLE DATA INSERTION SCRIPT (ENGLISH VERSION)
  SQL Server 2022 - EventEase System
============================================================================

  Purpose: Insert realistic sample data for all tables
  Context: Events in Ho Chi Minh City area
  Event Types: Conferences, Concerts, Workshops, Meetups, Sports, etc.
  
  IMPORTANT: Run this script AFTER running COMPLETE_DATABASE_SETUP.sql
  
============================================================================
*/

USE [event-ease-db];
GO

PRINT '============================================================================';
PRINT 'STARTING DATA INSERTION...';
PRINT '============================================================================';
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

-- Organizer roles
INSERT INTO user_role (user_id, role) VALUES
(5, 'ROLE_ORGANIZER'),
(6, 'ROLE_ORGANIZER'),
(7, 'ROLE_ORGANIZER'),
(8, 'ROLE_ORGANIZER');

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
-- Event 1: Tech Conference (COMING_SOON - Future)
(N'Saigon Tech Summit 2025',
 N'The biggest technology conference of 2025 in Ho Chi Minh City featuring top experts in AI, Cloud Computing, and Blockchain. Venue: SECC Saigon Exhibition & Convention Center, District 7.',
 'COMING_SOON',
 5,
 '2026-03-15 08:00:00',
 '2026-03-15 18:00:00',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'),

-- Event 2: Music Concert (COMING_SOON - Future)
(N'Vpop Live Concert - Saigon Night',
 N'Vpop music night featuring Vietnam''s top artists. Energetic music atmosphere in the heart of Saigon. Venue: Phu Tho Indoor Stadium, District 11.',
 'COMING_SOON',
 6,
 '2026-02-20 19:00:00',
 '2026-02-20 22:30:00',
 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'),

-- Event 3: University Workshop (COMING_SOON - Future)
(N'Workshop: Introduction to AI & Machine Learning',
 N'Hands-on workshop on AI and Machine Learning for students. Learn how to build your first ML model. Venue: Ho Chi Minh City University of Technology (Online).',
 'COMING_SOON',
 7,
 '2026-01-25 14:00:00',
 '2026-01-25 17:00:00',
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'),

-- Event 4: Startup Meetup (COMING_SOON - Future)
(N'Saigon Startup Meetup #15',
 N'Meet and connect with the Saigon startup community. Share experiences, find partners and investors. Venue: The Coffee House Signature, Nguyen Hue Street, District 1.',
 'COMING_SOON',
 5,
 '2026-02-10 18:00:00',
 '2026-02-10 21:00:00',
 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800'),

-- Event 5: Food Festival (COMING_SOON - Future)
(N'Saigon Food Festival 2025',
 N'Discover specialties from all three regions of Vietnam in the heart of Saigon. Over 100 food stalls, art performances and many exciting activities. Venue: Tao Dan Park, District 1.',
 'COMING_SOON',
 6,
 '2026-03-08 10:00:00',
 '2026-03-08 20:00:00',
 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),

-- Event 6: Marathon (COMING_SOON - Future)
(N'Saigon International Marathon 2026',
 N'Saigon International Marathon with distances: 5km, 10km, 21km, 42km. Start and finish at Landmark 81. Register early for discounts!',
 'COMING_SOON',
 5,
 '2026-04-06 05:00:00',
 '2026-04-06 12:00:00',
 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800'),

-- Event 7: Yoga & Meditation Retreat (COMING_SOON - Future)
(N'Wellness Weekend: Yoga & Meditation by the River',
 N'Rejuvenate your mind and body with a weekend of yoga, meditation, and wellness activities along the Saigon River. Suitable for all levels. Venue: Saigon Sports Club, District 2.',
 'COMING_SOON',
 8,
 '2026-05-16 06:00:00',
 '2026-05-17 18:00:00',
 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),

-- ============================================================================
-- ONGOING EVENTS (Started before Dec 8, 2025 and ending after Dec 8, 2025)
-- ============================================================================

-- Event 8: ONGOING - Winter Art Exhibition (Started Dec 1, ends Dec 20, 2025)
(N'Winter Art Exhibition 2025',
 N'Explore stunning artworks from local and international artists. A month-long exhibition showcasing contemporary and traditional Vietnamese art. Venue: Fine Arts Museum, District 1.',
 'ONGOING',
 6,
 '2025-12-01 09:00:00',
 '2025-12-20 18:00:00',
 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800'),

-- Event 9: ONGOING - Tech Bootcamp 2025 (Started Dec 5, ends Dec 15, 2025)
(N'Full-Stack Developer Bootcamp',
 N'Intensive 10-day bootcamp covering React, Node.js, and cloud deployment. Build real-world projects with industry mentors. Venue: Saigon Tech Hub, District 7.',
 'ONGOING',
 5,
 '2025-12-05 08:00:00',
 '2025-12-15 17:00:00',
 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800'),

-- Event 10: ONGOING - Holiday Music Festival (Started Dec 6, ends Dec 12, 2025)
(N'Saigon Holiday Music Festival',
 N'A week of live music performances featuring local bands and international DJs. Food, drinks, and holiday cheer! Venue: District 2 Riverside Park.',
 'ONGOING',
 6,
 '2025-12-06 16:00:00',
 '2025-12-12 23:00:00',
 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'),

-- ============================================================================
-- COMPLETED EVENTS (Ended before Dec 8, 2025)
-- ============================================================================

-- Event 11: COMPLETED - Autumn Tech Conference (Oct 15-16, 2025)
(N'Autumn Tech Conference 2025',
 N'Annual tech conference featuring talks on AI, blockchain, and cloud computing. Over 50 speakers and 1000 attendees. Venue: SECC, District 7.',
 'COMPLETED',
 5,
 '2025-10-15 08:00:00',
 '2025-10-16 18:00:00',
 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'),

-- Event 12: COMPLETED - Halloween Concert (Oct 31, 2025)
(N'Halloween Night Concert',
 N'Spooky music night with costume contest and special performances. The biggest Halloween party in Saigon! Venue: Phu Tho Stadium, District 11.',
 'COMPLETED',
 6,
 '2025-10-31 19:00:00',
 '2025-10-31 23:59:00',
 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800'),

-- Event 13: COMPLETED - Startup Weekend (Nov 8-10, 2025)
(N'Saigon Startup Weekend November',
 N'54-hour event where entrepreneurs pitch ideas, form teams, and launch startups. Mentors, investors, and amazing networking. Venue: Innovation Hub, District 1.',
 'COMPLETED',
 5,
 '2025-11-08 18:00:00',
 '2025-11-10 21:00:00',
 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'),

-- Event 14: COMPLETED - Food & Wine Festival (Nov 20-22, 2025)
(N'Saigon Food & Wine Festival',
 N'Three days of culinary excellence featuring top chefs, wine tastings, and cooking workshops. Over 80 food stalls. Venue: Crescent Mall, District 7.',
 'COMPLETED',
 6,
 '2025-11-20 10:00:00',
 '2025-11-22 22:00:00',
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'),

-- Event 15: COMPLETED - Charity Run (Nov 30, 2025)
(N'Run for Education 2025',
 N'Annual charity run supporting underprivileged students. Distances: 3km, 5km, 10km. All proceeds go to education scholarships. Venue: Phu My Hung, District 7.',
 'COMPLETED',
 8,
 '2025-11-30 05:30:00',
 '2025-11-30 10:00:00',
 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800');

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

-- ============================================================================
-- REGULATIONS FOR ONGOING EVENTS (Events 8-10)
-- ============================================================================

-- Regulations for Event 8 (Winter Art Exhibition)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(8, N'No flash photography allowed'),
(8, N'Do not touch the artworks'),
(8, N'Large bags must be checked at the entrance');

-- Regulations for Event 9 (Tech Bootcamp)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(9, N'Bring your own laptop with minimum 8GB RAM'),
(9, N'Pre-install VS Code and Node.js before Day 1'),
(9, N'100% attendance required for certificate');

-- Regulations for Event 10 (Holiday Music Festival)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(10, N'No outside food or drinks allowed'),
(10, N'VIP wristbands must be worn at all times'),
(10, N'Children under 12 must be accompanied by an adult');

-- ============================================================================
-- REGULATIONS FOR COMPLETED EVENTS (Events 11-15)
-- ============================================================================

-- Regulations for Event 11 (Autumn Tech Conference)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(11, N'Business casual dress code'),
(11, N'Bring business cards for networking'),
(11, N'Recording is prohibited without permission');

-- Regulations for Event 12 (Halloween Concert)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(12, N'Costumes encouraged but no masks covering full face'),
(12, N'No flammable props or real weapons'),
(12, N'Age 16+ recommended');

-- Regulations for Event 13 (Startup Weekend)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(13, N'Teams must be formed on-site'),
(13, N'All code must be written during the event'),
(13, N'Intellectual property belongs to the team');

-- Regulations for Event 14 (Food & Wine Festival)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(14, N'Must be 18+ for wine tasting'),
(14, N'ID required for alcohol purchases'),
(14, N'No pets allowed except service animals');

-- Regulations for Event 15 (Charity Run)
INSERT INTO event_regulation (event_id, aregulation) VALUES
(15, N'Race bib must be visible at all times'),
(15, N'Follow traffic marshal instructions'),
(15, N'Medical check recommended before participation');

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

-- ============================================================================
-- SESSIONS FOR ONGOING EVENTS (Events 8-10)
-- ============================================================================

-- Event 8: Winter Art Exhibition - 1 session (All-day exhibition)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(8, '2025-12-01 09:00:00', '2025-12-20 18:00:00', 500, 'OFFLINE');

-- Event 9: Tech Bootcamp - 2 sessions (Week 1 & Week 2)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(9, '2025-12-05 08:00:00', '2025-12-10 17:00:00', 50, 'OFFLINE'),
(9, '2025-12-11 08:00:00', '2025-12-15 17:00:00', 50, 'OFFLINE');

-- Event 10: Holiday Music Festival - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(10, '2025-12-06 16:00:00', '2025-12-12 23:00:00', 2000, 'OFFLINE');

-- ============================================================================
-- SESSIONS FOR COMPLETED EVENTS (Events 11-15)
-- ============================================================================

-- Event 11: Autumn Tech Conference - 2 sessions (Day 1 & Day 2)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(11, '2025-10-15 08:00:00', '2025-10-15 18:00:00', 500, 'OFFLINE'),
(11, '2025-10-16 08:00:00', '2025-10-16 18:00:00', 500, 'OFFLINE');

-- Event 12: Halloween Concert - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(12, '2025-10-31 19:00:00', '2025-10-31 23:59:00', 3000, 'OFFLINE');

-- Event 13: Startup Weekend - 1 session (54-hour event)
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(13, '2025-11-08 18:00:00', '2025-11-10 21:00:00', 200, 'OFFLINE');

-- Event 14: Food & Wine Festival - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(14, '2025-11-20 10:00:00', '2025-11-22 22:00:00', 5000, 'OFFLINE');

-- Event 15: Charity Run - 1 session
INSERT INTO [session] (event_id, start_date_time, end_date_time, max_capacity, type) VALUES
(15, '2025-11-30 05:30:00', '2025-11-30 10:00:00', 1500, 'OFFLINE');

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

-- ============================================================================
-- OFFLINE SESSIONS FOR ONGOING EVENTS (Events 8-10)
-- ============================================================================

-- Event 8: Winter Art Exhibition
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(10, 8, N'Fine Arts Museum of Ho Chi Minh City', N'97A Pho Duc Chinh, Nguyen Thai Binh Ward, District 1, Ho Chi Minh City');

-- Event 9: Tech Bootcamp - Both weeks
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(11, 9, N'Saigon Tech Hub', N'123 Nguyen Van Linh, Tan Phu Ward, District 7, Ho Chi Minh City'),
(12, 9, N'Saigon Tech Hub', N'123 Nguyen Van Linh, Tan Phu Ward, District 7, Ho Chi Minh City');

-- Event 10: Holiday Music Festival
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(13, 10, N'District 2 Riverside Park', N'Xa Lo Ha Noi, Thao Dien Ward, District 2, Ho Chi Minh City');

-- ============================================================================
-- OFFLINE SESSIONS FOR COMPLETED EVENTS (Events 11-15)
-- ============================================================================

-- Event 11: Autumn Tech Conference - Both days
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(14, 11, N'SECC - Saigon Exhibition & Convention Center', N'799 Nguyen Van Linh, Tan Phu Ward, District 7, Ho Chi Minh City'),
(15, 11, N'SECC - Saigon Exhibition & Convention Center', N'799 Nguyen Van Linh, Tan Phu Ward, District 7, Ho Chi Minh City');

-- Event 12: Halloween Concert
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(16, 12, N'Phu Tho Indoor Stadium', N'01 Lac Long Quan, Ward 10, District 11, Ho Chi Minh City');

-- Event 13: Startup Weekend
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(17, 13, N'Saigon Innovation Hub', N'12 Ton Duc Thang, Ben Nghe Ward, District 1, Ho Chi Minh City');

-- Event 14: Food & Wine Festival
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(18, 14, N'Crescent Mall', N'101 Ton Dat Tien, Tan Phu Ward, District 7, Ho Chi Minh City');

-- Event 15: Charity Run
INSERT INTO offline_session (session_id, event_id, venue_name, venue_address) VALUES
(19, 15, N'Phu My Hung Urban Area', N'Tan Phong Ward, District 7, Ho Chi Minh City');

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

-- ============================================================================
-- TICKET CATEGORIES FOR ONGOING EVENTS (Events 8-10)
-- ============================================================================

-- Event 8: Winter Art Exhibition (Session 10)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'General Admission', 100000, 300, '2025-11-15 00:00:00', '2025-12-19 23:59:59', 10, 8),
(N'Student Discount', 50000, 150, '2025-11-15 00:00:00', '2025-12-19 23:59:59', 10, 8),
(N'VIP Guided Tour', 300000, 50, '2025-11-15 00:00:00', '2025-12-19 23:59:59', 10, 8);

-- Event 9: Tech Bootcamp - Week 1 (Session 11)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Full Bootcamp Pass', 5000000, 40, '2025-11-01 00:00:00', '2025-12-04 23:59:59', 11, 9),
(N'Early Bird Special', 4000000, 10, '2025-11-01 00:00:00', '2025-11-15 23:59:59', 11, 9);

-- Event 9: Tech Bootcamp - Week 2 (Session 12)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Week 2 Only', 2500000, 20, '2025-11-01 00:00:00', '2025-12-10 23:59:59', 12, 9);

-- Event 10: Holiday Music Festival (Session 13)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'General Entry', 200000, 1500, '2025-11-20 00:00:00', '2025-12-11 23:59:59', 13, 10),
(N'VIP Zone', 500000, 300, '2025-11-20 00:00:00', '2025-12-11 23:59:59', 13, 10),
(N'Weekend Pass (All Days)', 350000, 200, '2025-11-20 00:00:00', '2025-12-05 23:59:59', 13, 10);

-- ============================================================================
-- TICKET CATEGORIES FOR COMPLETED EVENTS (Events 11-15)
-- ============================================================================

-- Event 11: Autumn Tech Conference - Day 1 (Session 14)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Day 1 Pass', 500000, 350, '2025-09-01 00:00:00', '2025-10-14 23:59:59', 14, 11),
(N'Day 1 VIP', 1200000, 100, '2025-09-01 00:00:00', '2025-10-14 23:59:59', 14, 11),
(N'Day 1 Student', 250000, 50, '2025-09-01 00:00:00', '2025-10-14 23:59:59', 14, 11);

-- Event 11: Autumn Tech Conference - Day 2 (Session 15)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Day 2 Pass', 500000, 350, '2025-09-01 00:00:00', '2025-10-15 23:59:59', 15, 11),
(N'Day 2 VIP', 1200000, 100, '2025-09-01 00:00:00', '2025-10-15 23:59:59', 15, 11),
(N'Full Conference Pass', 900000, 200, '2025-09-01 00:00:00', '2025-10-14 23:59:59', 15, 11);

-- Event 12: Halloween Concert (Session 16)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Standing Zone', 600000, 2000, '2025-09-15 00:00:00', '2025-10-30 23:59:59', 16, 12),
(N'Seated Premium', 1000000, 500, '2025-09-15 00:00:00', '2025-10-30 23:59:59', 16, 12),
(N'VIP Backstage', 2000000, 100, '2025-09-15 00:00:00', '2025-10-30 23:59:59', 16, 12);

-- Event 13: Startup Weekend (Session 17)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Participant Pass', 500000, 150, '2025-10-01 00:00:00', '2025-11-07 23:59:59', 17, 13),
(N'Mentor/Judge Pass', 0, 30, '2025-10-01 00:00:00', '2025-11-07 23:59:59', 17, 13),
(N'Observer Pass', 200000, 20, '2025-10-01 00:00:00', '2025-11-07 23:59:59', 17, 13);

-- Event 14: Food & Wine Festival (Session 18)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'Day Entry', 150000, 3000, '2025-10-15 00:00:00', '2025-11-21 23:59:59', 18, 14),
(N'3-Day Pass', 350000, 1500, '2025-10-15 00:00:00', '2025-11-19 23:59:59', 18, 14),
(N'Wine Tasting VIP', 800000, 500, '2025-10-15 00:00:00', '2025-11-19 23:59:59', 18, 14);

-- Event 15: Charity Run (Session 19)
INSERT INTO ticket_category (category_name, price, maximum_slot, start_date_time, end_date_time, session_id, event_id) VALUES
(N'3KM Fun Run', 100000, 500, '2025-10-01 00:00:00', '2025-11-29 23:59:59', 19, 15),
(N'5KM Run', 150000, 500, '2025-10-01 00:00:00', '2025-11-29 23:59:59', 19, 15),
(N'10KM Run', 200000, 500, '2025-10-01 00:00:00', '2025-11-29 23:59:59', 19, 15);

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
('AWAITING_PAYMENT', 'VND', 1200000, 4, '2024-12-04 15:30:00', '2024-12-04 15:30:00'),

-- ============================================================================
-- ORDERS FOR COMPLETED EVENTS (More sales data for reporting)
-- ============================================================================

-- Orders for Event 11: Autumn Tech Conference (COMPLETED)
('PAID', 'VND', 500000, 1, '2025-09-15 10:00:00', '2025-09-15 10:05:00'),  -- Order 5: Day 1 Pass
('PAID', 'VND', 1200000, 2, '2025-09-20 14:30:00', '2025-09-20 14:35:00'), -- Order 6: Day 1 VIP
('PAID', 'VND', 900000, 3, '2025-10-01 09:00:00', '2025-10-01 09:05:00'),  -- Order 7: Full Conference Pass
('PAID', 'VND', 1000000, 4, '2025-10-05 16:00:00', '2025-10-05 16:05:00'), -- Order 8: 2x Day 1 Pass

-- Orders for Event 12: Halloween Concert (COMPLETED)
('PAID', 'VND', 600000, 1, '2025-10-01 11:00:00', '2025-10-01 11:05:00'),  -- Order 9: Standing Zone
('PAID', 'VND', 2000000, 2, '2025-10-10 15:00:00', '2025-10-10 15:05:00'), -- Order 10: VIP Backstage
('PAID', 'VND', 1200000, 3, '2025-10-15 10:00:00', '2025-10-15 10:05:00'), -- Order 11: 2x Standing Zone

-- Orders for Event 13: Startup Weekend (COMPLETED)
('PAID', 'VND', 500000, 1, '2025-10-20 09:00:00', '2025-10-20 09:05:00'),  -- Order 12: Participant Pass
('PAID', 'VND', 1000000, 4, '2025-10-25 14:00:00', '2025-10-25 14:05:00'), -- Order 13: 2x Participant Pass

-- Orders for Event 14: Food & Wine Festival (COMPLETED)
('PAID', 'VND', 150000, 1, '2025-11-01 10:00:00', '2025-11-01 10:05:00'),  -- Order 14: Day Entry
('PAID', 'VND', 350000, 2, '2025-11-05 11:00:00', '2025-11-05 11:05:00'),  -- Order 15: 3-Day Pass
('PAID', 'VND', 800000, 3, '2025-11-10 09:00:00', '2025-11-10 09:05:00'),  -- Order 16: Wine Tasting VIP
('PAID', 'VND', 300000, 4, '2025-11-15 16:00:00', '2025-11-15 16:05:00'),  -- Order 17: 2x Day Entry

-- Orders for Event 15: Charity Run (COMPLETED)
('PAID', 'VND', 150000, 1, '2025-11-01 08:00:00', '2025-11-01 08:05:00'),  -- Order 18: 5KM Run
('PAID', 'VND', 200000, 2, '2025-11-10 10:00:00', '2025-11-10 10:05:00'),  -- Order 19: 10KM Run
('PAID', 'VND', 100000, 3, '2025-11-20 09:00:00', '2025-11-20 09:05:00'),  -- Order 20: 3KM Fun Run

-- ============================================================================
-- ORDERS FOR ONGOING EVENTS
-- ============================================================================

-- Orders for Event 8: Winter Art Exhibition (ONGOING)
('PAID', 'VND', 100000, 1, '2025-11-25 10:00:00', '2025-11-25 10:05:00'),  -- Order 21: General Admission
('PAID', 'VND', 300000, 2, '2025-11-28 14:00:00', '2025-11-28 14:05:00'),  -- Order 22: VIP Guided Tour
('PAID', 'VND', 50000, 3, '2025-12-01 11:00:00', '2025-12-01 11:05:00'),   -- Order 23: Student Discount

-- Orders for Event 9: Tech Bootcamp (ONGOING)
('PAID', 'VND', 5000000, 1, '2025-11-15 09:00:00', '2025-11-15 09:05:00'), -- Order 24: Full Bootcamp Pass
('PAID', 'VND', 4000000, 4, '2025-11-10 10:00:00', '2025-11-10 10:05:00'), -- Order 25: Early Bird Special

-- Orders for Event 10: Holiday Music Festival (ONGOING)
('PAID', 'VND', 200000, 1, '2025-12-01 10:00:00', '2025-12-01 10:05:00'),  -- Order 26: General Entry
('PAID', 'VND', 500000, 2, '2025-12-02 11:00:00', '2025-12-02 11:05:00'),  -- Order 27: VIP Zone
('PAID', 'VND', 350000, 3, '2025-12-03 09:00:00', '2025-12-03 09:05:00');  -- Order 28: Weekend Pass

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
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-004-YOGA1&size=300x300', 0, 17, 4, '2024-12-04 15:30:45'),

-- ============================================================================
-- TICKETS FOR COMPLETED EVENTS (with used_flag = 1 for checked-in tickets)
-- ============================================================================

-- Event 11: Autumn Tech Conference (Category IDs: 29-34)
-- Category 29: Day 1 Pass, 30: Day 1 VIP, 31: Day 1 Student, 32: Day 2 Pass, 33: Day 2 VIP, 34: Full Conference Pass
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-ATC-001&size=300x300', 1, 29, 5, '2025-09-15 10:00:30'),   -- Order 5: Day 1 Pass (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-ATC-002&size=300x300', 1, 30, 6, '2025-09-20 14:30:30'),   -- Order 6: Day 1 VIP (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-ATC-003&size=300x300', 1, 34, 7, '2025-10-01 09:00:30'),   -- Order 7: Full Conference Pass (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-ATC-004&size=300x300', 1, 29, 8, '2025-10-05 16:00:30'),   -- Order 8: Day 1 Pass x1 (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-ATC-005&size=300x300', 1, 29, 8, '2025-10-05 16:00:31'),   -- Order 8: Day 1 Pass x2 (checked-in)

-- Event 12: Halloween Concert (Category IDs: 35-37)
-- Category 35: Standing Zone, 36: Seated Premium, 37: VIP Backstage
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HWC-001&size=300x300', 1, 35, 9, '2025-10-01 11:00:30'),   -- Order 9: Standing Zone (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HWC-002&size=300x300', 1, 37, 10, '2025-10-10 15:00:30'),  -- Order 10: VIP Backstage (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HWC-003&size=300x300', 1, 35, 11, '2025-10-15 10:00:30'),  -- Order 11: Standing Zone x1 (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HWC-004&size=300x300', 1, 35, 11, '2025-10-15 10:00:31'),  -- Order 11: Standing Zone x2 (checked-in)

-- Event 13: Startup Weekend (Category IDs: 38-40)
-- Category 38: Participant Pass, 39: Mentor/Judge Pass, 40: Observer Pass
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-SWE-001&size=300x300', 1, 38, 12, '2025-10-20 09:00:30'),  -- Order 12: Participant Pass (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-SWE-002&size=300x300', 1, 38, 13, '2025-10-25 14:00:30'),  -- Order 13: Participant Pass x1 (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-SWE-003&size=300x300', 1, 38, 13, '2025-10-25 14:00:31'),  -- Order 13: Participant Pass x2 (checked-in)

-- Event 14: Food & Wine Festival (Category IDs: 41-43)
-- Category 41: Day Entry, 42: 3-Day Pass, 43: Wine Tasting VIP
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-FWF-001&size=300x300', 1, 41, 14, '2025-11-01 10:00:30'),  -- Order 14: Day Entry (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-FWF-002&size=300x300', 1, 42, 15, '2025-11-05 11:00:30'),  -- Order 15: 3-Day Pass (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-FWF-003&size=300x300', 1, 43, 16, '2025-11-10 09:00:30'),  -- Order 16: Wine Tasting VIP (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-FWF-004&size=300x300', 1, 41, 17, '2025-11-15 16:00:30'),  -- Order 17: Day Entry x1 (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-FWF-005&size=300x300', 1, 41, 17, '2025-11-15 16:00:31'),  -- Order 17: Day Entry x2 (checked-in)

-- Event 15: Charity Run (Category IDs: 44-46)
-- Category 44: 3KM Fun Run, 45: 5KM Run, 46: 10KM Run
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-CRN-001&size=300x300', 1, 45, 18, '2025-11-01 08:00:30'),  -- Order 18: 5KM Run (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-CRN-002&size=300x300', 1, 46, 19, '2025-11-10 10:00:30'),  -- Order 19: 10KM Run (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-CRN-003&size=300x300', 1, 44, 20, '2025-11-20 09:00:30'),  -- Order 20: 3KM Fun Run (checked-in)

-- ============================================================================
-- TICKETS FOR ONGOING EVENTS (some checked-in, some not yet)
-- ============================================================================

-- Event 8: Winter Art Exhibition (Category IDs: 20-22)
-- Category 20: General Admission, 21: Student Discount, 22: VIP Guided Tour
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-WAE-001&size=300x300', 1, 20, 21, '2025-11-25 10:00:30'),  -- Order 21: General Admission (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-WAE-002&size=300x300', 0, 22, 22, '2025-11-28 14:00:30'),  -- Order 22: VIP Guided Tour (not checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-WAE-003&size=300x300', 0, 21, 23, '2025-12-01 11:00:30'),  -- Order 23: Student Discount (not checked-in)

-- Event 9: Tech Bootcamp (Category IDs: 23-25)
-- Category 23: Full Bootcamp Pass, 24: Early Bird Special, 25: Week 2 Only
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-TBC-001&size=300x300', 1, 23, 24, '2025-11-15 09:00:30'),  -- Order 24: Full Bootcamp Pass (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-TBC-002&size=300x300', 1, 24, 25, '2025-11-10 10:00:30'),  -- Order 25: Early Bird Special (checked-in)

-- Event 10: Holiday Music Festival (Category IDs: 26-28)
-- Category 26: General Entry, 27: VIP Zone, 28: Weekend Pass (All Days)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HMF-001&size=300x300', 1, 26, 26, '2025-12-01 10:00:30'),  -- Order 26: General Entry (checked-in)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HMF-002&size=300x300', 0, 27, 27, '2025-12-02 11:00:30'),  -- Order 27: VIP Zone (not checked-in yet)
('https://api.qrserver.com/v1/create-qr-code/?data=TKT-HMF-003&size=300x300', 0, 28, 28, '2025-12-03 09:00:30');  -- Order 28: Weekend Pass (not checked-in yet)

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
(4, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-004-ZALOPAY&size=300x300', '2024-12-04 15:31:00'),   -- ZaloPay

-- ============================================================================
-- PAYMENT TRANSACTIONS FOR COMPLETED EVENTS
-- ============================================================================

-- Event 11: Autumn Tech Conference payments
(5, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-005-MOMO&size=300x300', '2025-09-15 10:05:00'),      -- MoMo
(6, 1, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-006-VCB&size=300x300', '2025-09-20 14:35:00'),       -- Vietcombank
(7, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-007-VNPAY&size=300x300', '2025-10-01 09:05:00'),     -- VNPay
(8, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-008-ZALOPAY&size=300x300', '2025-10-05 16:05:00'),   -- ZaloPay

-- Event 12: Halloween Concert payments
(9, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-009-MOMO&size=300x300', '2025-10-01 11:05:00'),      -- MoMo
(10, 1, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-010-VCB&size=300x300', '2025-10-10 15:05:00'),      -- Vietcombank
(11, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-011-VNPAY&size=300x300', '2025-10-15 10:05:00'),    -- VNPay

-- Event 13: Startup Weekend payments
(12, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-012-ZALOPAY&size=300x300', '2025-10-20 09:05:00'),  -- ZaloPay
(13, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-013-MOMO&size=300x300', '2025-10-25 14:05:00'),     -- MoMo

-- Event 14: Food & Wine Festival payments
(14, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-014-VNPAY&size=300x300', '2025-11-01 10:05:00'),    -- VNPay
(15, 1, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-015-VCB&size=300x300', '2025-11-05 11:05:00'),      -- Vietcombank
(16, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-016-MOMO&size=300x300', '2025-11-10 09:05:00'),     -- MoMo
(17, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-017-ZALOPAY&size=300x300', '2025-11-15 16:05:00'),  -- ZaloPay

-- Event 15: Charity Run payments
(18, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-018-MOMO&size=300x300', '2025-11-01 08:05:00'),     -- MoMo
(19, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-019-VNPAY&size=300x300', '2025-11-10 10:05:00'),    -- VNPay
(20, 1, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-020-VCB&size=300x300', '2025-11-20 09:05:00'),      -- Vietcombank

-- ============================================================================
-- PAYMENT TRANSACTIONS FOR ONGOING EVENTS
-- ============================================================================

-- Event 8: Winter Art Exhibition payments
(21, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-021-ZALOPAY&size=300x300', '2025-11-25 10:05:00'),  -- ZaloPay
(22, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-022-MOMO&size=300x300', '2025-11-28 14:05:00'),     -- MoMo
(23, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-023-VNPAY&size=300x300', '2025-12-01 11:05:00'),    -- VNPay

-- Event 9: Tech Bootcamp payments
(24, 1, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-024-VCB&size=300x300', '2025-11-15 09:05:00'),      -- Vietcombank
(25, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-025-MOMO&size=300x300', '2025-11-10 10:05:00'),     -- MoMo

-- Event 10: Holiday Music Festival payments
(26, 5, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-026-ZALOPAY&size=300x300', '2025-12-01 10:05:00'),  -- ZaloPay
(27, 6, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-027-VNPAY&size=300x300', '2025-12-02 11:05:00'),    -- VNPay
(28, 4, 'https://api.qrserver.com/v1/create-qr-code/?data=PAY-028-MOMO&size=300x300', '2025-12-03 09:05:00');     -- MoMo

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
PRINT 'Event Status Summary:';
PRINT '============================================================================';
SELECT event_status, COUNT(*) AS [Count] FROM event GROUP BY event_status;

PRINT '';
PRINT '============================================================================';
PRINT 'Sample Events Created:';
PRINT '============================================================================';
PRINT '';
PRINT '--- COMING_SOON Events (Future) ---';
PRINT '1. Saigon Tech Summit 2025 (Conference - March 2026)';
PRINT '2. Vpop Live Concert - Saigon Night (Music - February 2026)';
PRINT '3. Introduction to AI & Machine Learning Workshop (Online - January 2026)';
PRINT '4. Saigon Startup Meetup #15 (Networking - February 2026)';
PRINT '5. Saigon Food Festival 2025 (Cultural - March 2026)';
PRINT '6. Saigon International Marathon 2026 (Sports - April 2026)';
PRINT '7. Wellness Weekend: Yoga & Meditation (Wellness - May 2026)';
PRINT '';
PRINT '--- ONGOING Events (Currently Active) ---';
PRINT '8. Winter Art Exhibition 2025 (Dec 1-20, 2025)';
PRINT '9. Full-Stack Developer Bootcamp (Dec 5-15, 2025)';
PRINT '10. Saigon Holiday Music Festival (Dec 6-12, 2025)';
PRINT '';
PRINT '--- COMPLETED Events (Past) ---';
PRINT '11. Autumn Tech Conference 2025 (Oct 15-16, 2025)';
PRINT '12. Halloween Night Concert (Oct 31, 2025)';
PRINT '13. Saigon Startup Weekend November (Nov 8-10, 2025)';
PRINT '14. Saigon Food & Wine Festival (Nov 20-22, 2025)';
PRINT '15. Run for Education 2025 (Nov 30, 2025)';
PRINT '';
PRINT 'All events are located in Ho Chi Minh City';
PRINT '============================================================================';
GO



-- =============================================
-- V7: Event DateTime Validation Trigger
-- =============================================
-- Purpose: Ensure event start and end times are in the future
-- Created: 2024-12-05
-- =============================================
-- Create trigger to validate event date/time
CREATE TRIGGER trg_ValidateEventDateTime
ON event
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EventId BIGINT;
    DECLARE @Title NVARCHAR(255);
    DECLARE @StartDateTime DATETIME;
    DECLARE @EndDateTime DATETIME;
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @ErrorMsg NVARCHAR(500);

    -- Check each inserted/updated event
    -- Use LOCAL cursor to avoid naming conflicts
    DECLARE event_cursor CURSOR LOCAL FOR
        SELECT event_id, title, start_date_time, end_date_time
        FROM inserted;

    OPEN event_cursor;
    FETCH NEXT FROM event_cursor INTO @EventId, @Title, @StartDateTime, @EndDateTime;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Validate start_date_time is in the future
        IF @StartDateTime <= @CurrentDateTime
        BEGIN
            CLOSE event_cursor;
            DEALLOCATE event_cursor;

            SET @ErrorMsg = CONCAT(
                'Event validation failed: Start date/time must be in the future. ',
                'Event "', @Title, '" (ID: ', @EventId, ') ',
                'has start time: ', CONVERT(VARCHAR, @StartDateTime, 120), ', ',
                'which is not after current time: ', CONVERT(VARCHAR, @CurrentDateTime, 120)
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate end_date_time is after start_date_time
        IF @EndDateTime <= @StartDateTime
        BEGIN
            CLOSE event_cursor;
            DEALLOCATE event_cursor;

            SET @ErrorMsg = CONCAT(
                'Event validation failed: End date/time must be after start date/time. ',
                'Event "', @Title, '" (ID: ', @EventId, ') ',
                'has start time: ', CONVERT(VARCHAR, @StartDateTime, 120), ', ',
                'end time: ', CONVERT(VARCHAR, @EndDateTime, 120)
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validate end_date_time is also in the future
        IF @EndDateTime <= @CurrentDateTime
        BEGIN
            CLOSE event_cursor;
            DEALLOCATE event_cursor;

            SET @ErrorMsg = CONCAT(
                'Event validation failed: End date/time must be in the future. ',
                'Event "', @Title, '" (ID: ', @EventId, ') ',
                'has end time: ', CONVERT(VARCHAR, @EndDateTime, 120), ', ',
                'which is not after current time: ', CONVERT(VARCHAR, @CurrentDateTime, 120)
            );

            RAISERROR(@ErrorMsg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        FETCH NEXT FROM event_cursor INTO @EventId, @Title, @StartDateTime, @EndDateTime;
    END

    CLOSE event_cursor;
    DEALLOCATE event_cursor;
END;
GO

-- Test comment: This trigger validates:
-- 1. start_date_time must be > GETDATE()
-- 2. end_date_time must be > start_date_time
-- 3. end_date_time must be > GETDATE()

PRINT '';
PRINT '============================================================================';
PRINT 'Trigger trg_ValidateEventDateTime has been created';
PRINT 'Future event insertions will be validated for proper date/time.';
PRINT '============================================================================';
GO

