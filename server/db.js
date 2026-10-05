import sql from 'mssql';

let poolPromise = null;

/**
 * Return active mssql ConnectionPool or create a new one using AZURE_SQL_CONNECTION_STRING
 * Throws an error with code 'NO_DB_CONFIG' if connection string is missing.
 */
export function getSqlPool() {
  const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;
  if (!connectionString) {
    const err = new Error('AZURE_SQL_CONNECTION_STRING is not set');
    err.code = 'NO_DB_CONFIG';
    throw err;
  }
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(connectionString)
      .connect()
      .then(pool => {
        pool.on('close', () => { poolPromise = null; });
        return pool;
      })
      .catch(err => {
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
}
