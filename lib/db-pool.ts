import { Pool } from 'pg-pool'

// Database connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lawfirm_dashboard',
  user: process.env.DB_USER || 'harrisonestenson',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of connections in the pool
  min: 2,  // Minimum number of connections in the pool
  idle: 10000, // Close idle connections after 10 seconds
  acquire: 30000, // Maximum time to acquire a connection (30 seconds)
  createTimeoutMillis: 30000, // Maximum time to create a connection
  destroyTimeoutMillis: 5000, // Maximum time to destroy a connection
  reapIntervalMillis: 1000, // How often to check for idle connections
  createRetryIntervalMillis: 200, // How often to retry creating a connection
})

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end()
  process.exit(0)
})

export default pool
