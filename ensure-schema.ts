import { Pool } from "pg";

let schemaEnsured = false;
let ensurePromise: Promise<boolean> | null = null;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  video_title TEXT,
  caption_style TEXT NOT NULL DEFAULT 'oneword',
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  progress_message TEXT,
  error_message TEXT,
  clips JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

async function doEnsureSchema(): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[DB] DATABASE_URL not set");
    return false;
  }

  try {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10000,
    });
    
    await pool.query(CREATE_TABLE_SQL);
    await pool.end();
    schemaEnsured = true;
    console.log("[DB] Schema ready");
    return true;
  } catch (e) {
    console.error("[DB] Schema error:", e);
    return false;
  }
}

export async function ensureSchema(): Promise<boolean> {
  if (schemaEnsured) return true;
  
  // Prevent multiple simultaneous calls
  if (ensurePromise) return ensurePromise;
  
  ensurePromise = doEnsureSchema();
  const result = await ensurePromise;
  ensurePromise = null;
  return result;
}
