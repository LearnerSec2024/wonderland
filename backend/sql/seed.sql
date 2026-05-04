USE WonderlandDB;
GO

INSERT INTO dbo.Rides
    (Name, Description, Category, ThrillLevel, MinimumHeightCm, Price, PointsEarned, ImageUrl)
SELECT
    'Dragon Rush Coaster',
    'A high-speed fantasy roller coaster through caves, fire tunnels and castle towers.',
    'Roller Coaster',
    'Extreme',
    140,
    45.00,
    120,
    '/images/rides/dragon-rush.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Rides WHERE Name = 'Dragon Rush Coaster'
);

INSERT INTO dbo.Rides
    (Name, Description, Category, ThrillLevel, MinimumHeightCm, Price, PointsEarned, ImageUrl)
SELECT
    'Pirate Splash Falls',
    'A family water adventure with pirate ships, waterfalls and surprise drops.',
    'Water Ride',
    'Medium',
    100,
    28.00,
    80,
    '/images/rides/pirate-splash.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Rides WHERE Name = 'Pirate Splash Falls'
);

INSERT INTO dbo.Rides
    (Name, Description, Category, ThrillLevel, MinimumHeightCm, Price, PointsEarned, ImageUrl)
SELECT
    'Galaxy Spinner',
    'A colourful spinning ride with lights, music and space-themed effects.',
    'Family Ride',
    'Medium',
    90,
    22.00,
    60,
    '/images/rides/galaxy-spinner.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Rides WHERE Name = 'Galaxy Spinner'
);

INSERT INTO dbo.Rides
    (Name, Description, Category, ThrillLevel, MinimumHeightCm, Price, PointsEarned, ImageUrl)
SELECT
    'Enchanted Carousel',
    'A magical carousel for younger guests and families.',
    'Kids Ride',
    'Low',
    NULL,
    12.00,
    30,
    '/images/rides/enchanted-carousel.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Rides WHERE Name = 'Enchanted Carousel'
);

INSERT INTO dbo.Accommodations
    (Name, Description, Type, PricePerNight, MaxGuests, ImageUrl)
SELECT
    'Castle View Hotel',
    'Premium rooms overlooking the Wonderland castle and evening fireworks.',
    'Hotel',
    320.00,
    4,
    '/images/accommodation/castle-view-hotel.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Accommodations WHERE Name = 'Castle View Hotel'
);

INSERT INTO dbo.Accommodations
    (Name, Description, Type, PricePerNight, MaxGuests, ImageUrl)
SELECT
    'Jungle Lodge',
    'Adventure-themed lodge surrounded by tropical gardens and family activities.',
    'Lodge',
    240.00,
    5,
    '/images/accommodation/jungle-lodge.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Accommodations WHERE Name = 'Jungle Lodge'
);

INSERT INTO dbo.Accommodations
    (Name, Description, Type, PricePerNight, MaxGuests, ImageUrl)
SELECT
    'Pirate Cove Cabins',
    'Fun themed cabins close to the water rides and pirate dining area.',
    'Cabin',
    180.00,
    6,
    '/images/accommodation/pirate-cove-cabins.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Accommodations WHERE Name = 'Pirate Cove Cabins'
);

INSERT INTO dbo.Accommodations
    (Name, Description, Type, PricePerNight, MaxGuests, ImageUrl)
SELECT
    'Galaxy Resort Suites',
    'Modern space-themed suites with premium park access and rewards bonuses.',
    'Resort',
    420.00,
    4,
    '/images/accommodation/galaxy-resort-suites.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Accommodations WHERE Name = 'Galaxy Resort Suites'
);

SELECT 'WonderlandDB seed data inserted successfully' AS Message;
GO
