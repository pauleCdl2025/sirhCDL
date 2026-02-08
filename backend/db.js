const { Pool } = require('pg');

// Configuration PostgreSQL - Supabase ou local
const useSupabase = process.env.SUPABASE_URL ||
  process.env.DB_HOST?.includes('supabase.co') ||
  (process.env.NODE_ENV === 'production' && process.env.DB_HOST);

const poolConfig = useSupabase
  ? {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'db.dwpkqdiunxbgumepkveb.supabase.co',
      database: process.env.DB_NAME || 'postgres',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      ssl: { rejectUnauthorized: false },
      options: '-c client_encoding=UTF8',
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'rh_portal',
      password: process.env.DB_PASSWORD || 'Cdl@2025',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      options: '-c client_encoding=UTF8',
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    };

const pool = new Pool(poolConfig);

module.exports = pool;