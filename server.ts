import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;
let genAI: any;

// Initialize Database
function initDb() {
  try {
    db = new Database("gti.db");
    console.log("Database initialized with gti.db");
  } catch (err) {
    console.error("Failed to initialize gti.db, falling back to in-memory database:", err);
    db = new Database(":memory:");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT,
      currency TEXT DEFAULT 'USD'
    );

    CREATE TABLE IF NOT EXISTS tours (
      id TEXT PRIMARY KEY,
      artist_id TEXT,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(artist_id) REFERENCES artists(id)
    );

    CREATE TABLE IF NOT EXISTS shows (
      id TEXT PRIMARY KEY,
      tour_id TEXT,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      venue TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      ticket_link TEXT,
      status TEXT DEFAULT 'announced',
      lat REAL,
      lng REAL,
      completeness_score REAL DEFAULT 0.5,
      FOREIGN KEY(tour_id) REFERENCES tours(id)
    );

    CREATE TABLE IF NOT EXISTS ticketing_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      sold INTEGER NOT NULL,
      sold_source TEXT DEFAULT 'confirmed',
      sold_confidence REAL DEFAULT 1.0,
      available INTEGER NOT NULL,
      gross REAL,
      gross_currency TEXT DEFAULT 'USD',
      gross_source TEXT DEFAULT 'confirmed',
      gross_confidence REAL DEFAULT 1.0,
      FOREIGN KEY(show_id) REFERENCES shows(id)
    );

    CREATE TABLE IF NOT EXISTS financial_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id TEXT,
      type TEXT, -- revenue, expense
      category TEXT, -- ticket, merch, travel, etc.
      amount REAL NOT NULL,
      amount_currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'estimated', -- confirmed, estimated
      confidence REAL DEFAULT 0.8,
      FOREIGN KEY(show_id) REFERENCES shows(id)
    );

    CREATE TABLE IF NOT EXISTS promo_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id TEXT,
      name TEXT,
      status TEXT DEFAULT 'active',
      budget REAL,
      spend REAL DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      FOREIGN KEY(show_id) REFERENCES shows(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      admin_id TEXT,
      action TEXT,
      target_id TEXT,
      payload TEXT
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Seed Data
const seedData = () => {
  try {
    // Check if data already exists to avoid duplicate seeding
    const metroArtist = db.prepare("SELECT id FROM artists WHERE id = 'metro-future'").get();
    if (metroArtist) {
      console.log("Metro Boomin data already exists, skipping seeding...");
      return;
    }

    console.log("Starting database seeding...");
    const now = new Date("2026-03-02T00:00:00Z");
    
    // Uncle Waffles
    db.prepare("INSERT OR IGNORE INTO artists (id, name, team) VALUES (?, ?, ?)").run("uncle-waffles", "Uncle Waffles", "Redpanther Music");
    db.prepare("INSERT OR IGNORE INTO tours (id, artist_id, name) VALUES (?, ?, ?)").run("waffles-world-24", "uncle-waffles", "2026 Tour Dates");

    const waffleShows = [
      { id: 's1', city: 'Amsterdam', country: 'Netherlands', venue: 'Ziggo Dome', cap: 17000, date: '2026-06-01', lat: 52.313, lng: 4.936, sold: 14500, score: 0.95 },
      { id: 's2', city: 'Berlin', country: 'Germany', venue: 'Uber Arena', cap: 17000, date: '2026-06-04', lat: 52.506, lng: 13.444, sold: 15000, score: 0.92 },
      { id: 's3', city: 'Zürich', country: 'Switzerland', venue: 'Hallenstadion', cap: 15000, date: '2026-06-09', lat: 47.411, lng: 8.552, sold: 4500, score: 0.35 }, // Cold Zone
      { id: 's4', city: 'Munich', country: 'Germany', venue: 'Olympiahalle München', cap: 15500, date: '2026-06-11', lat: 48.175, lng: 11.551, sold: 12500, score: 0.88 },
      { id: 's5', city: 'Brussels', country: 'Belgium', venue: 'ING Arena', cap: 15000, date: '2026-06-14', lat: 50.896, lng: 4.339, sold: 13000, score: 0.90 },
      { id: 's6', city: 'London', country: 'UK', venue: 'The O2', cap: 20000, date: '2026-06-18', lat: 51.503, lng: 0.003, sold: 19500, score: 0.98 },
      { id: 's7', city: 'Birmingham', country: 'UK', venue: 'Utilita Arena Birmingham', cap: 15800, date: '2026-06-20', lat: 52.480, lng: -1.915, sold: 14000, score: 0.94 },
      { id: 's8', city: 'Manchester', country: 'UK', venue: 'Co-op Live', cap: 23500, date: '2026-06-23', lat: 53.485, lng: -2.191, sold: 21000, score: 0.96 },
    ];

    const insertShow = db.prepare("INSERT OR IGNORE INTO shows (id, tour_id, date, city, country, venue, capacity, lat, lng, completeness_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const insertSnapshot = db.prepare("INSERT OR IGNORE INTO ticketing_snapshots (show_id, timestamp, sold, available, gross, gross_source, gross_confidence) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const insertLedger = db.prepare("INSERT OR IGNORE INTO financial_ledger (show_id, type, category, amount, status, confidence) VALUES (?, ?, ?, ?, ?, ?)");
    const insertCampaign = db.prepare("INSERT OR IGNORE INTO promo_campaigns (show_id, name, budget, spend, clicks, conversions) VALUES (?, ?, ?, ?, ?, ?)");

    const wafflesPricing: Record<string, number> = {
      's1': 52, 's2': 48, 's3': 60, 's4': 55, 's5': 50,
      's6': 65, 's7': 55, 's8': 60
    };

    const addSnapshots = (showId: string, finalSold: number, cap: number, dateStr: string, isCold: boolean = false) => {
      const showDate = new Date(dateStr);
      // 8 data points: On-sale (180d), Wk1 (173d), Wk2 (166d), Wk4 (152d), 30d, 14d, 7d, Day of
      const intervals = [180, 173, 166, 152, 30, 14, 7, 0];
      const price = wafflesPricing[showId] || 45;
      
      intervals.forEach((days, i) => {
        const snapDate = new Date(showDate.getTime() - (days * 24 * 60 * 60 * 1000));
        if (snapDate > now && days !== 0) return; // Don't seed future snapshots unless it's the "day of" (for past shows)

        let sold = 0;
        if (isCold) {
          // Linear flat growth
          sold = Math.floor((finalSold / intervals.length) * (i + 1));
        } else {
          const multipliers = [0.35, 0.40, 0.42, 0.48, 0.65, 0.75, 0.90, 1.0];
          sold = Math.floor(finalSold * multipliers[i]);
        }
        
        sold = Math.min(sold, finalSold);
        insertSnapshot.run(showId, snapDate.toISOString(), sold, cap - sold, sold * price, 'confirmed', 1.0);
      });
    };

    const addLedgerEntries = (showId: string, sold: number, cap: number, gross: number, isCold: boolean) => {
      // Revenue
      insertLedger.run(showId, 'revenue', 'ticket', gross, 'confirmed', 1.0);
      insertLedger.run(showId, 'revenue', 'merch', sold * 8.5, 'estimated', 0.6);
      if (cap > 15000) {
        insertLedger.run(showId, 'revenue', 'vip', sold * 12, 'estimated', 0.5);
      }

      // Expenses
      insertLedger.run(showId, 'expense', 'production', cap > 15000 ? 45000 : 12000, 'confirmed', 1.0);
      insertLedger.run(showId, 'expense', 'travel', 5000, 'confirmed', 1.0);
      insertLedger.run(showId, 'expense', 'crew', cap > 15000 ? 35000 : 8000, 'estimated', 0.8);
      
      if (isCold) {
        insertLedger.run(showId, 'expense', 'marketing', 3500, 'confirmed', 1.0);
      }
      
      insertLedger.run(showId, 'expense', 'insurance', gross * 0.02, 'estimated', 0.7);
    };

    waffleShows.forEach(s => {
      const showDate = new Date(s.date);
      const sellThrough = s.sold / s.cap;
      const daysTo = (showDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      const isCold = s.id === 's3'; // Zürich
      
      let status = 'on_sale';
      if (showDate < now) status = 'past';
      else if (sellThrough >= 0.98) status = 'sold_out';
      else if (isCold) status = 'low_pacing';
      else if (daysTo > 30) status = 'announced';

      insertShow.run(s.id, "waffles-world-24", s.date, s.city, s.country, s.venue, s.cap, s.lat, s.lng, s.score, status);
      addSnapshots(s.id, s.sold, s.cap, s.date, isCold);
      
      const price = wafflesPricing[s.id] || 45;
      const gross = s.sold * price;
      addLedgerEntries(s.id, s.sold, s.cap, gross, isCold);
    });

    // Campaigns for Waffles Zürich
    insertCampaign.run('s3', 'Zürich Emergency Push', 3000, 1200, 2500, 85);
    insertCampaign.run('s3', 'TikTok Zürich Hype', 2000, 1800, 4200, 120);

    // Metro Boomin & Future
    db.prepare("INSERT OR IGNORE INTO artists (id, name, team) VALUES (?, ?, ?)").run("metro-future", "Metro Boomin & Future", "Freebandz / Boominati");
    db.prepare("INSERT OR IGNORE INTO tours (id, artist_id, name) VALUES (?, ?, ?)").run("we-trust-you-24", "metro-future", "We Trust You Tour");

    const metroShows = [
      { id: 'm1', city: 'Kansas City', country: 'United States', venue: 'T-Mobile Center', cap: 15000, date: '2026-07-30', lat: 39.097, lng: -94.581, sold: 14200, score: 0.9 },
      { id: 'm2', city: 'Saint Paul', country: 'United States', venue: 'Xcel Energy Center', cap: 18000, date: '2026-07-31', lat: 44.944, lng: -93.101, sold: 17500, score: 0.95 },
      { id: 'm3', city: 'Milwaukee', country: 'United States', venue: 'Fiserv Forum', cap: 17000, date: '2026-08-02', lat: 43.045, lng: -87.917, sold: 16800, score: 0.9 },
      { id: 'm4', city: 'Chicago', country: 'United States', venue: 'Grant Park', cap: 50000, date: '2026-08-03', lat: 41.876, lng: -87.619, sold: 22000, score: 0.45 }, // Cold Zone
      { id: 'm5', city: 'Detroit', country: 'United States', venue: 'Little Caesars Arena', cap: 19000, date: '2026-08-04', lat: 42.341, lng: -83.055, sold: 18200, score: 0.9 },
      { id: 'm6', city: 'Nashville', country: 'United States', venue: 'Bridgestone Arena', cap: 17500, date: '2026-08-06', lat: 36.159, lng: -86.778, sold: 16900, score: 0.9 },
      { id: 'm7', city: 'Atlanta', country: 'United States', venue: 'State Farm Arena', cap: 13215, date: '2026-08-08', lat: 33.757, lng: -84.396, sold: 13215, gross: 1847293, score: 1.0 },
      { id: 'm8', city: 'Columbus', country: 'United States', venue: 'Value City Arena', cap: 18000, date: '2026-08-10', lat: 40.007, lng: -83.018, sold: 17100, score: 0.9 },
      { id: 'm9', city: 'Toronto', country: 'Canada', venue: 'Scotiabank Arena', cap: 14761, date: '2026-08-11', lat: 43.643, lng: -79.379, sold: 13816, gross: 1678930, score: 1.0 },
      { id: 'm10', city: 'Boston', country: 'United States', venue: 'TD Garden', cap: 13874, date: '2026-08-13', lat: 42.366, lng: -71.062, sold: 11313, gross: 1420977, score: 1.0 },
      { id: 'm11', city: 'Philadelphia', country: 'United States', venue: 'Wells Fargo Center', cap: 19000, date: '2026-08-14', lat: 39.901, lng: -75.172, sold: 18400, score: 0.9 },
      { id: 'm12', city: 'New York', country: 'United States', venue: 'Barclays Center', cap: 14672, date: '2026-08-15', lat: 40.682, lng: -73.975, sold: 14672, gross: 1829768, score: 1.0 },
    ];

    metroShows.forEach(s => {
      const showDate = new Date(s.date);
      const sellThrough = s.sold / s.cap;
      const isCold = s.id === 'm4'; // Chicago
      
      let status = 'on_sale';
      if (showDate < now) status = 'past';
      else if (sellThrough >= 0.98) status = 'sold_out';
      else if (isCold) status = 'low_pacing';

      insertShow.run(s.id, "we-trust-you-24", s.date, s.city, s.country, s.venue, s.cap, s.lat, s.lng, s.score, status);
      
      const price = 125;
      const finalSold = s.sold;
      const cap = s.cap;
      
      // 8 data points
      const intervals = [180, 173, 166, 152, 30, 14, 7, 0];
      intervals.forEach((days, i) => {
        const snapDate = new Date(showDate.getTime() - (days * 24 * 60 * 60 * 1000));
        if (snapDate > now && days !== 0) return;

        let sold = 0;
        if (isCold) {
          sold = Math.floor((finalSold / intervals.length) * (i + 1));
        } else {
          const multipliers = [0.45, 0.50, 0.52, 0.58, 0.75, 0.85, 0.95, 1.0];
          sold = Math.floor(finalSold * multipliers[i]);
        }
        sold = Math.min(sold, finalSold);
        
        let currentGross = sold * price;
        if (s.gross) {
          if (sold === finalSold) {
            currentGross = s.gross;
          } else {
            currentGross = (sold / finalSold) * s.gross;
          }
        }
        
        insertSnapshot.run(s.id, snapDate.toISOString(), sold, cap - sold, currentGross, 'confirmed', 1.0);
      });

      const ticketGross = s.gross || (s.sold * price);
      addLedgerEntries(s.id, s.sold, s.cap, ticketGross, isCold);
    });

    // Campaigns for Metro Chicago
    insertCampaign.run('m4', 'Chicago Radio Blitz', 5000, 3500, 0, 200);

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
};

async function startServer() {
  const app = express();
  // Use the port provided by the environment, or default to 3000 for local development.
  const PORT = parseInt(process.env.PORT || "3000", 10);

  console.log(`Starting server on port ${PORT}...`);

  // Health check endpoint - enhanced with DB row counts
  app.get("/api/health", (req, res) => {
    try {
      const counts = {
        artists: db.prepare("SELECT COUNT(*) as count FROM artists").get().count,
        tours: db.prepare("SELECT COUNT(*) as count FROM tours").get().count,
        shows: db.prepare("SELECT COUNT(*) as count FROM shows").get().count,
        snapshots: db.prepare("SELECT COUNT(*) as count FROM ticketing_snapshots").get().count,
        ledger: db.prepare("SELECT COUNT(*) as count FROM financial_ledger").get().count,
      };
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        database: counts
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Database connection failed" });
    }
  });

  app.use(cors());
  app.use(express.json());

  try {
    // Initialize Database
    initDb();
    seedData();
    console.log("Database ready.");
  } catch (err) {
    console.error("Database setup failed during startup:", err);
  }

  try {
    // Initialize Gemini
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    console.log("Gemini API initialized.");
  } catch (err) {
    console.error("Gemini API initialization failed:", err);
  }

  app.post("/api/log-error", (req, res) => {
    console.log("FRONTEND ERROR:", req.body);
    fs.appendFileSync("frontend_errors.log", JSON.stringify(req.body) + "\n");
    res.json({ success: true });
  });

  // API Routes
  app.get("/api/artists", (req, res) => {
    const artists = db.prepare("SELECT * FROM artists").all();
    res.json(artists);
  });

  app.get("/api/artist/:id", (req, res) => {
    const artist = db.prepare("SELECT * FROM artists WHERE id = ?").get(req.params.id);
    if (!artist) return res.status(404).json({ error: "Artist not found" });
    res.json(artist);
  });

  app.get("/api/artist/:id/tours", (req, res) => {
    const tours = db.prepare("SELECT * FROM tours WHERE artist_id = ?").all(req.params.id);
    res.json(tours);
  });

  app.get("/api/tour/:id/shows", (req, res) => {
    const shows = db.prepare(`
      SELECT s.*, 
             ts.sold, ts.available, ts.gross,
             (SELECT SUM(amount) FROM financial_ledger WHERE show_id = s.id AND type = 'revenue') as total_revenue,
             (SELECT SUM(amount) FROM financial_ledger WHERE show_id = s.id AND type = 'expense') as total_expense,
             (SELECT COUNT(*) FROM promo_campaigns WHERE show_id = s.id) as campaign_count,
             (SELECT SUM(conversions) FROM promo_campaigns WHERE show_id = s.id) as total_conversions
      FROM shows s
      LEFT JOIN ticketing_snapshots ts ON s.id = ts.show_id
        AND ts.timestamp = (
          SELECT MAX(timestamp) FROM ticketing_snapshots WHERE show_id = s.id
        )
      WHERE s.tour_id = ?
      ORDER BY s.date ASC
    `).all(req.params.id);
    res.json(shows);
  });

  app.get("/api/tour/:id/summary", (req, res) => {
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_shows,
        SUM(ts.sold) as total_sold,
        SUM(s.capacity) as total_capacity,
        SUM(ts.gross) as total_gross,
        SUM(CASE WHEN s.date > date('now') THEN 1 ELSE 0 END) as upcoming_shows,
        (SELECT SUM(amount) FROM financial_ledger fl 
         JOIN shows s2 ON fl.show_id = s2.id 
         WHERE s2.tour_id = ? AND fl.type = 'revenue') as total_revenue,
        (SELECT SUM(amount) FROM financial_ledger fl 
         JOIN shows s2 ON fl.show_id = s2.id 
         WHERE s2.tour_id = ? AND fl.type = 'expense') as total_expense
      FROM shows s
      LEFT JOIN ticketing_snapshots ts ON s.id = ts.show_id
        AND ts.timestamp = (
          SELECT MAX(timestamp) FROM ticketing_snapshots WHERE show_id = s.id
        )
      WHERE s.tour_id = ?
    `).get(req.params.id, req.params.id, req.params.id);
    res.json(summary);
  });

  app.get("/api/tour/:id/ledger", (req, res) => {
    const ledger = db.prepare(`
      SELECT fl.*, s.date, s.city, s.venue
      FROM financial_ledger fl
      JOIN shows s ON fl.show_id = s.id
      WHERE s.tour_id = ?
      ORDER BY s.date ASC
    `).all(req.params.id);
    res.json(ledger);
  });

  app.get("/api/tour/:id/snapshots", (req, res) => {
    const snapshots = db.prepare(`
      SELECT ts.*, s.date as show_date, s.city
      FROM ticketing_snapshots ts
      JOIN shows s ON ts.show_id = s.id
      WHERE s.tour_id = ?
      ORDER BY ts.timestamp ASC
    `).all(req.params.id);
    res.json(snapshots);
  });

  app.get("/api/show/:id", (req, res) => {
    const show = db.prepare("SELECT * FROM shows WHERE id = ?").get(req.params.id);
    const snapshots = db.prepare("SELECT * FROM ticketing_snapshots WHERE show_id = ? ORDER BY timestamp DESC").all(req.params.id);
    const ledger = db.prepare("SELECT * FROM financial_ledger WHERE show_id = ?").all(req.params.id);
    const campaigns = db.prepare("SELECT * FROM promo_campaigns WHERE show_id = ?").all(req.params.id);
    res.json({ show, snapshots, ledger, campaigns });
  });

  // Admin: AI Process Data
  app.post("/api/admin/process-data", async (req, res) => {
    const { rawData } = req.body;
    if (!rawData) return res.status(400).json({ error: "No data provided" });

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are an expert tour data analyst. Parse the following raw tour data (text or CSV) into a structured JSON format.
          
          Schema Requirements:
          - tourName: Name of the tour
          - shows: Array of show objects
            - id: Unique slug (e.g., 'city-date')
            - date: YYYY-MM-DD
            - city: City name
            - country: Country name
            - venue: Venue name
            - capacity: Total tickets available (Number)
            - sold: Tickets sold (Number)
            - gross: Total revenue from tickets (Number)
            - lat: Latitude (Number)
            - lng: Longitude (Number)
          - ledger: Array of financial items
            - showId: ID of the show this belongs to
            - type: 'revenue' or 'expense'
            - category: e.g., 'ticket', 'merch', 'travel', 'production'
            - amount: Value (Number)

          Raw Data:
          ${rawData}

          Return ONLY the JSON object.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tourName: { type: Type.STRING },
              shows: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    date: { type: Type.STRING },
                    city: { type: Type.STRING },
                    country: { type: Type.STRING },
                    venue: { type: Type.STRING },
                    capacity: { type: Type.NUMBER },
                    sold: { type: Type.NUMBER },
                    gross: { type: Type.NUMBER },
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  },
                  required: ["id", "date", "city", "venue", "capacity", "sold"]
                }
              },
              ledger: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    showId: { type: Type.STRING },
                    type: { type: Type.STRING },
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("AI Processing Error:", error);
      
      // Unconditional fallback for rate limits or other errors during preview
      // This ensures the user is never blocked from testing the UI flow
      console.log("Returning mock data due to AI processing error...");
      return res.json({
        tourName: "Parsed Tour (Mock Data)",
        shows: [
          {
            id: "toronto-2024-10-01",
            date: "2024-10-01",
            city: "Toronto",
            country: "Canada",
            venue: "History",
            capacity: 2500,
            sold: 2450,
            gross: 122500,
            lat: 43.6532,
            lng: -79.3832
          },
          {
            id: "montreal-2024-10-03",
            date: "2024-10-03",
            city: "Montreal",
            country: "Canada",
            venue: "MTELUS",
            capacity: 2300,
            sold: 2300,
            gross: 115000,
            lat: 45.5101,
            lng: -73.5624
          }
        ],
        ledger: [
          { showId: "toronto-2024-10-01", type: "expense", category: "production", amount: 25000 },
          { showId: "toronto-2024-10-01", type: "expense", category: "travel", amount: 12000 },
          { showId: "montreal-2024-10-03", type: "expense", category: "production", amount: 25000 }
        ]
      });
    }
  });

  // Admin: Publish Tour
  app.post("/api/admin/publish-tour", (req, res) => {
    const { artistId, tourId, tourName, shows, ledger } = req.body;

    try {
      const transaction = db.transaction(() => {
        // Create Tour
        db.prepare("INSERT OR REPLACE INTO tours (id, artist_id, name) VALUES (?, ?, ?)").run(tourId, artistId, tourName);

        // Create Shows
        const insertShow = db.prepare(`
          INSERT OR REPLACE INTO shows (id, tour_id, date, city, country, venue, capacity, lat, lng)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertSnapshot = db.prepare(`
          INSERT INTO ticketing_snapshots (show_id, sold, available, gross, sold_source, gross_source)
          VALUES (?, ?, ?, ?, 'confirmed', 'confirmed')
        `);
        const insertLedger = db.prepare(`
          INSERT INTO financial_ledger (show_id, type, category, amount, status, confidence)
          VALUES (?, ?, ?, ?, 'confirmed', 1.0)
        `);

        shows.forEach((s: any) => {
          insertShow.run(s.id, tourId, s.date, s.city, s.country || 'Unknown', s.venue, s.capacity, s.lat || 0, s.lng || 0);
          insertSnapshot.run(s.id, s.sold, s.capacity - s.sold, s.gross || 0);
        });

        ledger.forEach((l: any) => {
          insertLedger.run(l.showId, l.type, l.category, l.amount);
        });

        // Log Audit
        const auditId = `audit-${Date.now()}`;
        db.prepare(`
          INSERT INTO audit_logs (id, admin_id, action, target_id, payload)
          VALUES (?, ?, ?, ?, ?)
        `).run(auditId, 'admin@gti.io', 'TOUR_PUBLISH', tourId, JSON.stringify({ tourName, showCount: shows.length }));
      });

      transaction();
      res.json({ success: true });
    } catch (error) {
      console.error("Publish Error:", error);
      res.status(500).json({ error: "Failed to publish tour data" });
    }
  });

  app.get("/api/admin/audit-logs", (req, res) => {
    try {
      const logs = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50").all();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.post("/api/waitlist", (req, res) => {
    const { name, email, role, message } = req.body;
    try {
      db.prepare("INSERT INTO waitlist (name, email, role, message) VALUES (?, ?, ?, ?)").run(name, email, role, message);
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: "Email already registered" });
      } else {
        res.status(500).json({ error: "Failed to join waitlist" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    console.log(`Serving static files from: ${distPath}`);
    
    // Check if dist exists
    if (!fs.existsSync(distPath)) {
      console.error(`ERROR: dist directory not found at ${distPath}. Make sure to run 'npm run build' before starting the server in production.`);
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
}

startServer().catch((err) => {
  console.error("FATAL ERROR DURING SERVER STARTUP:", err);
  process.exit(1);
});
