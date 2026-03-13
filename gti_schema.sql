-- GTI V1 Data Model Schema
-- Supports historical data with missing info and estimation metadata

-- Artists: The primary entity
CREATE TABLE artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team TEXT,
    base_currency TEXT DEFAULT 'USD'
);

-- Tours: A collection of shows for an artist
CREATE TABLE tours (
    id TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, cancelled
    FOREIGN KEY(artist_id) REFERENCES artists(id)
);

-- Markets: Geographic regions/cities
CREATE TABLE markets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "New York"
    region TEXT, -- e.g., "North America"
    country_code TEXT -- e.g., "US"
);

-- Venues: Physical locations for shows
CREATE TABLE venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    market_id TEXT NOT NULL,
    address TEXT,
    lat REAL,
    lng REAL,
    FOREIGN KEY(market_id) REFERENCES markets(id)
);

-- Shows: Individual events
-- Unique Key: date + venue_id + city (market_id)
CREATE TABLE shows (
    id TEXT PRIMARY KEY,
    tour_id TEXT NOT NULL,
    venue_id TEXT NOT NULL,
    market_id TEXT NOT NULL,
    date TEXT NOT NULL, -- ISO 8601
    status TEXT DEFAULT 'announced',
    UNIQUE(date, venue_id, market_id),
    FOREIGN KEY(tour_id) REFERENCES tours(id),
    FOREIGN KEY(venue_id) REFERENCES venues(id),
    FOREIGN KEY(market_id) REFERENCES markets(id)
);

-- Ticketing Snapshots: Point-in-time sales data
CREATE TABLE ticketing_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    
    capacity_value INTEGER,
    capacity_source TEXT, -- confirmed, estimated
    capacity_confidence REAL, -- 0.0 to 1.0
    
    sold_value INTEGER,
    sold_source TEXT,
    sold_confidence REAL,
    
    gross_value REAL,
    gross_currency TEXT,
    gross_source TEXT,
    gross_confidence REAL,
    
    FOREIGN KEY(show_id) REFERENCES shows(id)
);

-- Financial Ledger: Revenue and Expense lines
CREATE TABLE financial_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL,
    entry_type TEXT NOT NULL, -- 'revenue' or 'expense'
    category TEXT NOT NULL, -- 'tickets', 'merch', 'travel', 'production', etc.
    label TEXT, -- specific description
    
    amount_value REAL NOT NULL,
    amount_currency TEXT NOT NULL,
    amount_source TEXT NOT NULL, -- confirmed, estimated
    amount_confidence REAL NOT NULL,
    
    FOREIGN KEY(show_id) REFERENCES shows(id)
);

-- Split Assumptions: How the net is divided
CREATE TABLE split_assumptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id TEXT,
    show_id TEXT, -- Can be tour-wide or show-specific
    entity_name TEXT NOT NULL, -- 'Artist', 'Agent', 'Manager', 'Tax'
    
    percentage_value REAL, -- e.g., 0.85 for 85%
    percentage_source TEXT,
    percentage_confidence REAL,
    
    FOREIGN KEY(tour_id) REFERENCES tours(id),
    FOREIGN KEY(show_id) REFERENCES shows(id)
);

-- Campaigns: Marketing efforts
CREATE TABLE campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL,
    name TEXT NOT NULL,
    platform TEXT, -- 'Meta', 'TikTok', 'Google'
    
    budget_value REAL,
    budget_currency TEXT,
    budget_source TEXT,
    budget_confidence REAL,
    
    spend_value REAL,
    spend_currency TEXT,
    spend_source TEXT,
    spend_confidence REAL,
    
    FOREIGN KEY(show_id) REFERENCES shows(id)
);
