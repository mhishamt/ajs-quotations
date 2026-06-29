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

function mapBody(b, username) {
  return {
    qnum: b.qnum, branch: b.branch, branch_label: b.branchLabel,
    quot_date: b.date || null,
    customer_company: b.custCompany, customer_attn: b.custAttn,
    customer_phone: b.custPhone, customer_email: b.custEmail,
    customer_cr: b.custCr, customer_vat: b.custVat,
    customer_addr: b.custAddr, customer_city: b.custCity,
    comp_name_en: b.compNameEn, comp_name_ar: b.compNameAr,
    comp_cr: b.compCr, comp_vat: b.compVat, comp_addr: b.compAddr,
    comp_city: b.compCity, comp_tel: b.compTel, comp_email: b.compEmail,
    comp_person: b.compPerson, comp_addr_ar: b.compAddrAr,
    our_ref: b.ourRef, your_ref: b.yourRef,
    currency: b.cur, vat_on: b.vatOn, discount: b.disc || 0,
    subtotal: b.sub || 0, vat_amount: b.vat || 0, total: b.total || 0,
    notes: b.notes, term_validity: b.termValidity,
    term_payment: b.termPayment, term_delivery: b.termDelivery,
    term_warranty: b.termWarranty, rows: b.rows || [],
    created_by: username,
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
      const { branch } = req.query;
      let query = supabase.from('quotations').select('*').order('created_at', { ascending: false });
      // Non-admins only see their branch
      if (authUser.role !== 'admin' && authUser.branch !== 'all') {
        query = query.eq('branch', authUser.branch);
      } else if (branch && branch !== 'all') {
        query = query.eq('branch', branch);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data: existing } = await supabase.from('quotations').select('id,qnum,branch_label').eq('qnum', body.qnum).maybeSingle();
      if (existing) {
        return res.status(409).json({ error: 'duplicate', message: `Quotation "${body.qnum}" already exists`, existingBranch: existing.branch_label || existing.branch });
      }
      const { data, error } = await supabase.from('quotations').insert([mapBody(body, authUser.username)]).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (authUser.role !== 'admin') return res.status(403).json({ error: 'Only admins can delete quotations' });
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
