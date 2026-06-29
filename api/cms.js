const { kv } = require('@vercel/kv');

const KEY = process.env.CMS_KV_KEY || 'atollsim:cms:v1';

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const content = (await kv.get(KEY)) || null;
      return send(res, 200, { content });
    }
    if (req.method === 'PUT') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      if (!body.content || typeof body.content !== 'object') {
        return send(res, 400, { error: 'Missing CMS content.' });
      }
      await kv.set(KEY, body.content);
      return send(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return send(res, 500, { error: error.message || 'CMS storage failed.' });
  }
};
