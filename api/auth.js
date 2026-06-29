const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'ajs-secret-change-this';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // LOGIN
  if (action === 'login' && req.method === 'POST') {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const { data: user, error } = await supabase
      .from('users').select('*').eq('username', username.toLowerCase()).eq('is_active', true).maybeSingle();

    if (error || !user) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    // Update last login
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.full_name, branch: user.branch },
      JWT_SECRET, { expiresIn: '8h' }
    );
    return res.status(200).json({ token, user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role, branch: user.branch } });
  }

  // CHANGE PASSWORD
  if (action === 'change-password' && req.method === 'POST') {
    const authUser = verifyToken(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('id', authUser.id).single();
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await supabase.from('users').update({ password_hash: hash }).eq('id', authUser.id);
    return res.status(200).json({ success: true });
  }

  // VERIFY TOKEN
  if (action === 'verify' && req.method === 'POST') {
    const authUser = verifyToken(req);
    if (!authUser) return res.status(401).json({ error: 'Invalid or expired token' });
    return res.status(200).json({ valid: true, user: authUser });
  }

  return res.status(404).json({ error: 'Unknown action' });
};

function verifyToken(req) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch { return null; }
}
