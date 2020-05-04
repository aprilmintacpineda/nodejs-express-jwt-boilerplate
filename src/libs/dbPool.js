/** @format */

const { encodeHTMLEntities, decodeHTMLEntities } = _require('libs/htmlEntities');
const dbPool = require('mysql2/promise').createPool({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
  waitForConnections: true,
  connectionLimit: 1e3,
  queueLimit: 0
});

function executeQuery (query, placeholders) {
  if (!placeholders) return dbPool.execute(query);

  return dbPool.execute(
    query,
    placeholders.map(placeholder => {
      // only escape string inputs
      if (typeof placeholder === 'string') return encodeHTMLEntities(placeholder);
      return placeholder;
    })
  );
}

module.exports = {
  insert: executeQuery,
  update: executeQuery,
  delete: executeQuery,
  select: async (query, placeholders) => {
    const results = await executeQuery(query, placeholders);
    results[0] = results[0].map(result =>
      Object.keys(result).reduce((accumulator, current) => {
        let value = result[current];
        if (typeof value === 'string') value = decodeHTMLEntities(value);
        accumulator[current] = value;
        return accumulator;
      }, {})
    );
    return results;
  }
};
