INSERT INTO spaces (name, type, status, floor, area, amenities, description, created_at, updated_at) VALUES
('Room-301', 'PRIVATE', 'AVAILABLE', 3, 25.0, '["AC","Fridge"]', 'South-facing single room', now(), now()),
('Room-302', 'PRIVATE', 'AVAILABLE', 3, 30.0, '["AC","Washer","Fridge"]', 'Duplex double room', now(), now()),
('Room-401', 'PRIVATE', 'AVAILABLE', 4, 20.0, '["AC"]', 'Clean single room', now(), now()),
('Room-402', 'PRIVATE', 'OCCUPIED', 4, 28.0, '["AC","Fridge"]', 'Occupied room', now(), now()),
('Room-501', 'PRIVATE', 'AVAILABLE', 5, 35.0, '["AC","Washer","Fridge","Built-in"]', 'Premium suite', now(), now());

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'SINGLE', 1, 1, 'South', 5000000, 500000, 50000, true, now(), now()
FROM spaces s WHERE s.name = 'Room-301';

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'DOUBLE', 2, 1, 'East', 8000000, 700000, 60000, true, now(), now()
FROM spaces s WHERE s.name = 'Room-302';

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'STUDIO', 1, 1, 'West', 3000000, 400000, 40000, false, now(), now()
FROM spaces s WHERE s.name = 'Room-401';

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'SINGLE', 1, 1, 'South', 6000000, 550000, 55000, true, now(), now()
FROM spaces s WHERE s.name = 'Room-402';

INSERT INTO private_space_details (space_id, room_type, room_count, bathroom_count, direction, deposit, monthly_rent, maintenance_fee, parking_available, created_at, updated_at)
SELECT s.space_id, 'SUITE', 2, 2, 'SouthEast', 15000000, 1200000, 100000, true, now(), now()
FROM spaces s WHERE s.name = 'Room-501';
