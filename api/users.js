const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = verifyToken(req);
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
  if (authUser.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  try {
    // GET all users
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('users').select('id,username,full_name,role,branch,is_active,created_at,last_login').order('created_at');
      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST - create user
    if (req.method === 'POST') {
      const { username, password, fullName, role, branch } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
      const existing = await supabase.from('users').select('id').eq('username', username.toLowerCase()).maybeSingle();
      if (existing.data) return res.status(409).json({ error: 'Username already exists' });
      const hash = await bcrypt.hash(password, 10);
      const { data, error } = await supabase.from('users').insert([{
        username: username.toLowerCase(), password_hash: hash,
        full_name: fullName, role: role || 'user', branch: branch || 'all'
      }]).select('id,username,full_name,role,branch,is_active').single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    // PUT - update user
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { fullName, role, branch, isActive, password } = req.body;
      const updates = { full_name: fullName, role, branch, is_active: isActive };
      if (password) updates.password_hash = await bcrypt.hash(password, 10);
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select('id,username,full_name,role,branch,is_active').single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // DELETE user
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (parseInt(id) === authUser.id) return res.status(400).json({ error: 'Cannot delete yourself' });
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
