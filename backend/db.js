require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');
const { promisify } = require('util');
const url = require('url');

pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const resolveIPv4 = promisify(dns.resolve4);

let pool;

const getConfig = async () => {
  let config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };

  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = new url.URL(process.env.DATABASE_URL);
      config = {
        user: dbUrl.username,
        password: dbUrl.password,
        host: dbUrl.hostname,
        port: dbUrl.port,
        database: dbUrl.pathname.split('/')[1],
        ssl: { rejectUnauthorized: false } // Required for Supabase
      };

      // FIX: Render uses IPv6 by default which fails with Supabase direct connection.
      // We force resolving the hostname to an IPv4 address.
      if (config.host && (config.host.includes('supabase.co') || config.host.includes('render'))) {
        try {
          console.log(`Resolving DNS for ${config.host}...`);
          const addresses = await resolveIPv4(config.host);
          if (addresses && addresses.length > 0) {
            console.log(`Resolved ${config.host} to IPv4: ${addresses[0]}`);
            config.host = addresses[0];
          }
        } catch (dnsErr) {
          console.warn('DNS IPv4 resolution failed, falling back to hostname:', dnsErr.message);
        }
      }
    } catch (err) {
      console.error('Error parsing DATABASE_URL:', err);
    }
  }

  return config;
};

// Singleton pool manager with async initialization
const getPool = async () => {
  if (pool) return pool;

  const config = await getConfig();
  pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
};

module.exports = {
  query: async (text, params) => {
    const p = await getPool();
    return p.query(text, params);
  },
};
