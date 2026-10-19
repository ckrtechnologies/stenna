import { supabase } from '../../config/supabase.js';

/**
 * ==============================================================================
 * Sales Tracking Repository
 * ==============================================================================
 * ARCHITECTURE RULES:
 * 1. Functions accept ONLY strictly validated DTOs or explicit IDs.
 * 2. NEVER receives raw `req.body` or arbitrary objects.
 * 3. All column fields are bound directly to validated DTO properties.
 */

// ------------------------------------------------------------------------------
// 1. ZONES
// ------------------------------------------------------------------------------

export async function insertZone(dto) {
  const { data, error } = await supabase
    .from('sales_zones')
    .insert({
      name: dto.name,
      description: dto.description ?? null,
      is_active: dto.is_active ?? true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateZone(id, dto) {
  const updates = {};
  if (dto.name !== undefined) updates.name = dto.name;
  if (dto.description !== undefined) updates.description = dto.description;
  if (dto.is_active !== undefined) updates.is_active = dto.is_active;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('sales_zones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listZones() {
  const { data, error } = await supabase
    .from('sales_zones')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getZoneById(id) {
  const { data, error } = await supabase
    .from('sales_zones')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteZone(id) {
  const { error } = await supabase
    .from('sales_zones')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ------------------------------------------------------------------------------
// 1b. MARKETS MASTER (Zone > Market > Shop)
// ------------------------------------------------------------------------------

export async function insertMarket(dto) {
  const { data, error } = await supabase
    .from('sales_markets')
    .insert({
      zone_id: dto.zone_id,
      name: dto.name,
      description: dto.description ?? null,
      city: dto.city ?? null,
      is_active: dto.is_active ?? true
    })
    .select(`
      *,
      sales_zones ( id, name )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMarket(id, dto) {
  const updates = {};
  if (dto.zone_id !== undefined) updates.zone_id = dto.zone_id;
  if (dto.name !== undefined) updates.name = dto.name;
  if (dto.description !== undefined) updates.description = dto.description;
  if (dto.city !== undefined) updates.city = dto.city;
  if (dto.is_active !== undefined) updates.is_active = dto.is_active;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('sales_markets')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      sales_zones ( id, name )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function listMarkets({ zoneId, zoneIds } = {}) {
  let q = supabase
    .from('sales_markets')
    .select(`
      *,
      sales_zones ( id, name )
    `)
    .order('name', { ascending: true });

  if (zoneId) {
    q = q.eq('zone_id', zoneId);
  } else if (zoneIds && zoneIds.length > 0) {
    q = q.in('zone_id', zoneIds);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getMarketById(id) {
  const { data, error } = await supabase
    .from('sales_markets')
    .select(`
      *,
      sales_zones ( id, name )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteMarket(id) {
  const { error } = await supabase
    .from('sales_markets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ------------------------------------------------------------------------------
// 2. SALES BOYS & ZONE MAPPINGS
// ------------------------------------------------------------------------------

export async function insertSalesBoy(dto) {
  const { data, error } = await supabase
    .from('sales_boys')
    .insert({
      name: dto.name,
      phone: dto.phone,
      password_hash: dto.password_hash,
      is_active: dto.is_active ?? true
    })
    .select('id, name, phone, is_active, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

export async function updateSalesBoy(id, dto) {
  const updates = {};
  if (dto.name !== undefined) updates.name = dto.name;
  if (dto.phone !== undefined) updates.phone = dto.phone;
  if (dto.password_hash !== undefined) updates.password_hash = dto.password_hash;
  if (dto.is_active !== undefined) updates.is_active = dto.is_active;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('sales_boys')
    .update(updates)
    .eq('id', id)
    .select('id, name, phone, is_active, created_at, updated_at')
    .single();

  if (error) throw error;
  return data;
}

export async function getSalesBoyByPhone(phone) {
  const { data, error } = await supabase
    .from('sales_boys')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSalesBoyById(id) {
  const { data, error } = await supabase
    .from('sales_boys')
    .select('id, name, phone, is_active, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listSalesBoys() {
  const { data, error } = await supabase
    .from('sales_boys')
    .select(`
      id,
      name,
      phone,
      is_active,
      created_at,
      sales_boy_zones (
        zone_id,
        sales_zones ( id, name )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function replaceSalesBoyZones(salesBoyId, zoneIds) {
  // 1. Clear existing
  const { error: delError } = await supabase
    .from('sales_boy_zones')
    .delete()
    .eq('sales_boy_id', salesBoyId);

  if (delError) throw delError;

  if (!zoneIds || zoneIds.length === 0) return [];

  // 2. Insert new mappings
  const rows = zoneIds.map((zoneId) => ({
    sales_boy_id: salesBoyId,
    zone_id: zoneId
  }));

  const { data, error: insError } = await supabase
    .from('sales_boy_zones')
    .insert(rows)
    .select();

  if (insError) throw insError;
  return data;
}

export async function getSalesBoyAssignedZoneIds(salesBoyId) {
  const { data, error } = await supabase
    .from('sales_boy_zones')
    .select('zone_id')
    .eq('sales_boy_id', salesBoyId);

  if (error) throw error;
  return (data || []).map((row) => row.zone_id);
}

// ------------------------------------------------------------------------------
// 3. VENDORS / RETAIL SHOPS
// ------------------------------------------------------------------------------

export async function insertVendor(dto) {
  const { data, error } = await supabase
    .from('sales_vendors')
    .insert({
      shop_name: dto.shop_name,
      phone: dto.phone,
      shop_address: dto.shop_address,
      contact_person: dto.contact_person,
      zone_id: dto.zone_id ?? null,
      market_id: dto.market_id ?? null,
      is_active: dto.is_active ?? true
    })
    .select(`
      *,
      sales_zones ( id, name ),
      sales_markets ( id, name )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function bulkInsertVendors(dtos) {
  if (!dtos || dtos.length === 0) return [];
  const rows = dtos.map((dto) => ({
    shop_name: dto.shop_name,
    phone: dto.phone,
    shop_address: dto.shop_address,
    contact_person: dto.contact_person,
    zone_id: dto.zone_id ?? null,
    market_id: dto.market_id ?? null,
    is_active: dto.is_active ?? true
  }));

  const { data, error } = await supabase
    .from('sales_vendors')
    .insert(rows)
    .select(`
      *,
      sales_zones ( id, name ),
      sales_markets ( id, name )
    `);

  if (error) throw error;
  return data || [];
}

export async function updateVendor(id, dto) {
  const updates = {};
  if (dto.shop_name !== undefined) updates.shop_name = dto.shop_name;
  if (dto.phone !== undefined) updates.phone = dto.phone;
  if (dto.shop_address !== undefined) updates.shop_address = dto.shop_address;
  if (dto.contact_person !== undefined) updates.contact_person = dto.contact_person;
  if (dto.zone_id !== undefined) updates.zone_id = dto.zone_id;
  if (dto.market_id !== undefined) updates.market_id = dto.market_id;
  if (dto.is_active !== undefined) updates.is_active = dto.is_active;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('sales_vendors')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      sales_zones ( id, name ),
      sales_markets ( id, name )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function listVendors({ zoneId, marketId, search, zoneIds } = {}) {
  let q = supabase
    .from('sales_vendors')
    .select(`
      *,
      sales_zones ( id, name ),
      sales_markets ( id, name )
    `)
    .order('shop_name', { ascending: true });

  if (marketId) {
    q = q.eq('market_id', marketId);
  }
  if (zoneId) {
    q = q.eq('zone_id', zoneId);
  } else if (zoneIds && zoneIds.length > 0) {
    q = q.in('zone_id', zoneIds);
  }

  if (search) {
    q = q.or(`shop_name.ilike.%${search}%,contact_person.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getVendorById(id) {
  const { data, error } = await supabase
    .from('sales_vendors')
    .select(`
      *,
      sales_zones ( id, name ),
      sales_markets ( id, name )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteVendor(id) {
  const { error } = await supabase
    .from('sales_vendors')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ------------------------------------------------------------------------------
// 4. FIELD VISITS & VISIT BOOKS
// ------------------------------------------------------------------------------

export async function insertVisit(dto) {
  const { data, error } = await supabase
    .from('sales_visits')
    .insert({
      sales_boy_id: dto.sales_boy_id,
      vendor_id: dto.vendor_id,
      is_available: dto.is_available,
      comments: dto.comments ?? null,
      visited_at: dto.visited_at ?? new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function insertVisitBooks(visitBooksDTOList) {
  if (!visitBooksDTOList || visitBooksDTOList.length === 0) return [];

  const rows = visitBooksDTOList.map((dto) => ({
    visit_id: dto.visit_id,
    book_id: dto.book_id,
    action_type: dto.action_type
  }));

  const { data, error } = await supabase
    .from('sales_visit_books')
    .insert(rows)
    .select();

  if (error) throw error;
  return data || [];
}

export async function listVisits({ vendorId, salesBoyId, zoneId, isAvailable, startDate, endDate, limit = 200 } = {}) {
  let q = supabase
    .from('sales_visits')
    .select(`
      *,
      sales_boys ( id, name, phone ),
      sales_vendors ( id, shop_name, contact_person, phone, shop_address, zone_id, market_id, sales_zones(id, name), sales_markets(id, name) ),
      sales_visit_books (
        id,
        action_type,
        book_id,
        books ( id, name, code, image_url )
      )
    `)
    .order('visited_at', { ascending: false })
    .limit(limit);

  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (salesBoyId) q = q.eq('sales_boy_id', salesBoyId);
  if (isAvailable !== undefined && isAvailable !== null && isAvailable !== '') {
    q = q.eq('is_available', isAvailable === 'true' || isAvailable === true);
  }
  if (startDate) q = q.gte('visited_at', startDate);
  if (endDate) q = q.lte('visited_at', endDate);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getVendorVisitHistory(vendorId) {
  const { data, error } = await supabase
    .from('sales_visits')
    .select(`
      *,
      sales_boys ( id, name, phone ),
      sales_visit_books (
        id,
        action_type,
        book_id,
        books ( id, name, code, image_url )
      )
    `)
    .eq('vendor_id', vendorId)
    .order('visited_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSalesBoyVisitsToday(salesBoyId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('sales_visits')
    .select(`
      *,
      sales_vendors ( id, shop_name, contact_person, phone ),
      sales_visit_books ( id, action_type, book_id )
    `)
    .eq('sales_boy_id', salesBoyId)
    .gte('visited_at', startOfDay.toISOString())
    .order('visited_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ------------------------------------------------------------------------------
// 5. SAMPLE BOOKS CATALOG (Read active books from existing books table)
// ------------------------------------------------------------------------------

export async function listActiveBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('id, name, code, description, image_url, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}
