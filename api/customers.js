const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'ajs-secret-change-this';

function verifyToken(req) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch { return null; }
}

function mapRow(r) {
  return {
    id: r.id,
    company: r.company,
    attn: r.attn,
    phone: r.phone,
    email: r.email,
    cr: r.cr,
    vat: r.vat,
    addr: r.addr,
    city: r.city,
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = verifyToken(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized. Please log in.' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('company', { ascending: true });
      if (error) throw error;
      return res.status(200).json((data || []).map(mapRow));
    }

    if (req.method === 'POST') {
      const b = req.body;
      if (!b.company || !b.company.trim()) return res.status(400).json({ error: 'Company name is required' });
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          company: b.company, attn: b.attn, phone: b.phone, email: b.email,
          cr: b.cr, vat: b.vat, addr: b.addr, city: b.city,
          created_by: authUser.username,
        }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(mapRow(data));
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const b = req.body;
      const { data, error } = await supabase
        .from('customers')
        .update({
          company: b.company, attn: b.attn, phone: b.phone, email: b.email,
          cr: b.cr, vat: b.vat, addr: b.addr, city: b.city,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(mapRow(data));
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
