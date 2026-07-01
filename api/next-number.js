const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'ajs-secret-change-this';
const PREFIXES = { main:'QT', cooling:'QT-CS', laundry:'QT-DL', contracting:'QT-GC' };

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(auth.slice(7), JWT_SECRET);
  } catch { return res.status(401).json({ error: 'Unauthorized' }); }

  const { branch = 'main' } = req.query;
  const prefix = PREFIXES[branch] || 'QT';
  const year = new Date().getFullYear();
  const { data } = await supabase.from('quotations').select('qnum').eq('branch', branch);
  let max = 0;
  (data || []).forEach(row => { const m = row.qnum.match(/-(\d+)$/); if (m) max = Math.max(max, parseInt(m[1], 10)); });
  return res.status(200).json({ next: `${prefix}-${year}-${String(max + 1).padStart(3, '0')}` });
};
