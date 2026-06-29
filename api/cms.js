const postgres = require('postgres');
const KEY = process.env.CMS_CONTENT_KEY || 'atollsim:cms:v1';
const DATABASE_URL = process.env.STORAGE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
let sql;
function getSql() {
  if (!DATABASE_URL) {
    const error = new Error('Missing PostgreSQL connection string. Connect Neon/Postgres storage to this Vercel project and expose STORAGE_URL, POSTGRES_URL, or DATABASE_URL.');
    error.statusCode = 500;
    throw error;
  }
  if (!sql) sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });
  return sql;
}
async function ensureTable(db) {
  await db`create table if not exists cms_content (key text primary key, content jsonb not null, updated_at timestamptz not null default now())`;
}
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const db = getSql();
    await ensureTable(db);
    if (req.method === 'GET') {
      const rows = await db`select content from cms_content where key = ${KEY} limit 1`;
      return res.status(200).json({ content: rows[0]?.content || null });
    }
    if (req.method === 'PUT') {
      const content = req.body?.content;
      if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Missing content object' });
      await db`insert into cms_content (key, content, updated_at) values (${KEY}, ${db.json(content)}, now()) on conflict (key) do update set content = excluded.content, updated_at = now()`;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || 'CMS storage error' });
  }
};
