// Configuration Supabase
// Ce fichier configure la connexion à Supabase PostgreSQL

const { Pool } = require('pg');

// Configuration pour Supabase PostgreSQL
// Supabase utilise PostgreSQL standard, donc on peut utiliser le même client pg
function createSupabasePool() {
  // Les variables d'environnement doivent être définies dans Netlify
  const config = {
    user: process.env.DB_USER || process.env.SUPABASE_DB_USER,
    host: process.env.DB_HOST || process.env.SUPABASE_DB_HOST,
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 5432,
    // Configuration SSL requise pour Supabase
    ssl: {
      rejectUnauthorized: false // Supabase utilise SSL
    },
    // Configuration pour l'encodage UTF-8
    options: '-c client_encoding=UTF8',
    // Connection timeout
    connectionTimeoutMillis: 10000,
    // Idle timeout
    idleTimeoutMillis: 30000,
    // Max connections (Supabase limite à 60 connexions simultanées)
    max: 20
  };

  const pool = new Pool(config);

  // Tester la connexion
  pool.on('connect', () => {
    console.log('✅ Connexion Supabase établie');
  });

  pool.on('error', (err) => {
    console.error('❌ Erreur de connexion Supabase:', err);
  });

  return pool;
}

module.exports = createSupabasePool;
