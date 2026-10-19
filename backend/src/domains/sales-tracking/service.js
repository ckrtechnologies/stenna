import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as repo from './repository.js';
import {
  CreateZoneDTO,
  UpdateZoneDTO,
  CreateVendorDTO,
  UpdateVendorDTO,
  CreateSalesBoyDTO,
  UpdateSalesBoyDTO,
  InsertVisitDTO,
  InsertVisitBookDTO
} from './validation.js';

/* ==============================================================================
 * Sales Tracking Service Layer
 * Business logic, strict DTO construction, and multi-entity orchestrations.
 * ============================================================================== */

// ------------------------------------------------------------------------------
// 1. AUTHENTICATION (Sales Boy Phone + Password)
// ------------------------------------------------------------------------------

export async function loginSalesBoy({ phone, password }) {
  const salesBoy = await repo.getSalesBoyByPhone(phone);
  if (!salesBoy || !salesBoy.is_active) {
    const error = new Error('Invalid phone number or account inactive');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, salesBoy.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Fetch assigned zones
  const assignedZoneIds = await repo.getSalesBoyAssignedZoneIds(salesBoy.id);

  const token = jwt.sign(
    {
      id: salesBoy.id,
      name: salesBoy.name,
      phone: salesBoy.phone,
      role: 'sales_boy',
      assignedZoneIds
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return {
    token,
    user: {
      id: salesBoy.id,
      name: salesBoy.name,
      phone: salesBoy.phone,
      role: 'sales_boy',
      assignedZoneIds
    }
  };
}

// ------------------------------------------------------------------------------
// 2. ZONE MASTER SERVICE
// ------------------------------------------------------------------------------

export async function createZone(rawInput) {
  const isActive = rawInput.isActive !== undefined ? rawInput.isActive : (rawInput.is_active !== undefined ? rawInput.is_active : true);
  // Construct and validate DTO
  const dto = CreateZoneDTO.parse({
    name: rawInput.name.trim(),
    description: rawInput.description ? rawInput.description.trim() : null,
    is_active: Boolean(isActive)
  });
  return await repo.insertZone(dto);
}

export async function updateZone(id, rawInput) {
  const isActive = rawInput.isActive !== undefined ? rawInput.isActive : rawInput.is_active;
  const dto = UpdateZoneDTO.parse({
    name: rawInput.name ? rawInput.name.trim() : undefined,
    description: rawInput.description !== undefined ? rawInput.description : undefined,
    is_active: isActive !== undefined ? Boolean(isActive) : undefined
  });
  return await repo.updateZone(id, dto);
}

export async function listZones() {
  return await repo.listZones();
}

export async function deleteZone(id) {
  return await repo.deleteZone(id);
}

// ------------------------------------------------------------------------------
// 3. VENDOR / RETAIL SHOPS SERVICE
// ------------------------------------------------------------------------------

export async function createVendor(rawInput) {
  const isActive = rawInput.isActive !== undefined ? rawInput.isActive : (rawInput.is_active !== undefined ? rawInput.is_active : true);
  // Construct and validate DTO
  const dto = CreateVendorDTO.parse({
    shop_name: rawInput.shopName.trim(),
    phone: rawInput.phone.trim(),
    shop_address: rawInput.shopAddress.trim(),
    contact_person: rawInput.contactPerson.trim(),
    zone_id: rawInput.zoneId || null,
    is_active: Boolean(isActive)
  });
  return await repo.insertVendor(dto);
}

export async function bulkImportVendors(rawVendorsList, defaultZoneId = null) {
  if (!Array.isArray(rawVendorsList) || rawVendorsList.length === 0) {
    const err = new Error('No vendor rows provided for import');
    err.status = 400;
    throw err;
  }

  // Fetch all zones to resolve zone names to zone_ids
  const existingZones = await repo.listZones();
  const zoneNameToIdMap = new Map();
  existingZones.forEach((z) => {
    zoneNameToIdMap.set(z.name.toLowerCase().trim(), z.id);
  });

  const validDTOs = [];
  const failedRows = [];

  rawVendorsList.forEach((raw, idx) => {
    try {
      const shopName = String(
        raw.shopName || raw.shop_name || raw['Shop Name'] || raw['shop name'] || raw.name || ''
      ).trim();

      let phone = String(
        raw.phone || raw.phoneNumber || raw.phone_number || raw['Phone'] || raw['Phone Number'] || raw.mobile || ''
      ).replace(/\D/g, '').trim();

      if (phone.length === 12 && phone.startsWith('91')) {
        phone = phone.substring(2);
      }

      const shopAddress = String(
        raw.shopAddress || raw.shop_address || raw.address || raw['Shop Address'] || raw['Address'] || ''
      ).trim();

      const contactPerson = String(
        raw.contactPerson || raw.contact_person || raw.owner || raw['Contact Person'] || raw['Owner Name'] || ''
      ).trim();

      // Resolve Zone: either given as zoneId (uuid), or zoneName string, or fallback defaultZoneId
      let zoneId = raw.zoneId || raw.zone_id || null;
      const zoneName = String(
        raw.zoneName || raw.zone_name || raw.zone || raw['Zone'] || raw['Zone Name'] || ''
      ).trim();

      if (zoneName && zoneNameToIdMap.has(zoneName.toLowerCase())) {
        zoneId = zoneNameToIdMap.get(zoneName.toLowerCase());
      } else if (!zoneId && defaultZoneId) {
        zoneId = defaultZoneId;
      }

      const isActive = raw.isActive !== undefined ? raw.isActive : (raw.is_active !== undefined ? raw.is_active : true);

      // Validate through strict DTO
      const dto = CreateVendorDTO.parse({
        shop_name: shopName,
        phone,
        shop_address: shopAddress,
        contact_person: contactPerson,
        zone_id: zoneId || null,
        is_active: Boolean(isActive)
      });

      validDTOs.push(dto);
    } catch (rowErr) {
      failedRows.push({
        rowNumber: idx + 1,
        raw,
        error: rowErr.errors ? rowErr.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') : rowErr.message
      });
    }
  });

  let inserted = [];
  if (validDTOs.length > 0) {
    const BATCH_SIZE = 100;
    for (let i = 0; i < validDTOs.length; i += BATCH_SIZE) {
      const batch = validDTOs.slice(i, i + BATCH_SIZE);
      const batchInserted = await repo.bulkInsertVendors(batch);
      inserted = inserted.concat(batchInserted);
    }
  }

  return {
    totalRows: rawVendorsList.length,
    insertedCount: inserted.length,
    failedCount: failedRows.length,
    inserted,
    failedRows
  };
}

export async function updateVendor(id, rawInput) {
  const isActive = rawInput.isActive !== undefined ? rawInput.isActive : rawInput.is_active;
  const dto = UpdateVendorDTO.parse({
    shop_name: rawInput.shopName ? rawInput.shopName.trim() : undefined,
    phone: rawInput.phone ? rawInput.phone.trim() : undefined,
    shop_address: rawInput.shopAddress ? rawInput.shopAddress.trim() : undefined,
    contact_person: rawInput.contactPerson ? rawInput.contactPerson.trim() : undefined,
    zone_id: rawInput.zoneId !== undefined ? (rawInput.zoneId || null) : undefined,
    is_active: isActive !== undefined ? Boolean(isActive) : undefined
  });
  return await repo.updateVendor(id, dto);
}

export async function listVendors(filters) {
  return await repo.listVendors(filters);
}

export async function getVendorDetailsWithHistory(vendorId) {
  const vendor = await repo.getVendorById(vendorId);
  if (!vendor) {
    const error = new Error('Vendor not found');
    error.status = 404;
    throw error;
  }

  const visits = await repo.getVendorVisitHistory(vendorId);

  // Compute aggregated book history (shown vs bought) across all visits
  const booksPitchedMap = new Map();
  const booksBoughtMap = new Map();

  visits.forEach((v) => {
    (v.sales_visit_books || []).forEach((vb) => {
      const book = vb.books;
      if (!book) return;
      if (vb.action_type === 'shown') {
        booksPitchedMap.set(book.id, book);
      } else if (vb.action_type === 'bought') {
        booksBoughtMap.set(book.id, book);
      }
    });
  });

  return {
    vendor,
    visits,
    bookHistory: {
      allShownBooks: Array.from(booksPitchedMap.values()),
      allBoughtBooks: Array.from(booksBoughtMap.values())
    }
  };
}

export async function deleteVendor(id) {
  return await repo.deleteVendor(id);
}

// ------------------------------------------------------------------------------
// 4. SALES BOYS MANAGEMENT SERVICE
// ------------------------------------------------------------------------------

export async function createSalesBoy(rawInput) {
  const isActive = rawInput.isActive !== undefined ? rawInput.isActive : (rawInput.is_active !== undefined ? rawInput.is_active : true);
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(rawInput.password, salt);

  // Construct and validate DTO
  const dto = CreateSalesBoyDTO.parse({
    name: rawInput.name.trim(),
    phone: rawInput.phone.trim(),
    password_hash,
    is_active: Boolean(isActive)
  });

  const created = await repo.insertSalesBoy(dto);

  if (rawInput.zoneIds && rawInput.zoneIds.length > 0) {
    await repo.replaceSalesBoyZones(created.id, rawInput.zoneIds);
  }

  return await repo.getSalesBoyById(created.id);
}

export async function updateSalesBoy(id, rawInput) {
  const updateData = {};
  if (rawInput.name) updateData.name = rawInput.name.trim();
  if (rawInput.phone) updateData.phone = rawInput.phone.trim();
  const isActive = rawInput.isActive !== undefined ? rawInput.isActive : rawInput.is_active;
  if (isActive !== undefined) updateData.is_active = Boolean(isActive);
  if (rawInput.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password_hash = await bcrypt.hash(rawInput.password, salt);
  }

  const dto = UpdateSalesBoyDTO.parse(updateData);
  const updated = await repo.updateSalesBoy(id, dto);

  if (rawInput.zoneIds !== undefined) {
    await repo.replaceSalesBoyZones(id, rawInput.zoneIds);
  }

  return updated;
}

export async function listSalesBoys() {
  return await repo.listSalesBoys();
}

export async function getSalesBoyZoneIds(salesBoyId) {
  return await repo.getSalesBoyAssignedZoneIds(salesBoyId);
}

// ------------------------------------------------------------------------------
// 5. FIELD VISITS & VISIT RECORDING SERVICE
// ------------------------------------------------------------------------------

export async function recordVisit({ salesBoyId, rawInput }) {
  // 1. Construct & validate the primary visit DTO
  const visitDTO = InsertVisitDTO.parse({
    sales_boy_id: salesBoyId,
    vendor_id: rawInput.vendorId,
    is_available: rawInput.isAvailable,
    comments: rawInput.comments ? rawInput.comments.trim() : null,
    visited_at: new Date().toISOString()
  });

  // 2. Insert primary visit
  const visit = await repo.insertVisit(visitDTO);

  // 3. Construct & validate visit books DTOs if shop was available
  const visitBooksDTOList = [];

  if (rawInput.isAvailable) {
    (rawInput.booksShown || []).forEach((bookId) => {
      visitBooksDTOList.push(
        InsertVisitBookDTO.parse({
          visit_id: visit.id,
          book_id: bookId,
          action_type: 'shown'
        })
      );
    });

    (rawInput.booksBought || []).forEach((bookId) => {
      visitBooksDTOList.push(
        InsertVisitBookDTO.parse({
          visit_id: visit.id,
          book_id: bookId,
          action_type: 'bought'
        })
      );
    });
  }

  // 4. Batch insert books mapping
  const booksRecorded = await repo.insertVisitBooks(visitBooksDTOList);

  return {
    ...visit,
    books: booksRecorded
  };
}

export async function listVisits(filters) {
  return await repo.listVisits(filters);
}

// ------------------------------------------------------------------------------
// 6. SALES BOY APP HOME DASHBOARD
// ------------------------------------------------------------------------------

export async function getSalesBoyAppDashboard(salesBoyId) {
  const assignedZoneIds = await repo.getSalesBoyAssignedZoneIds(salesBoyId);
  const assignedShops = await repo.listVendors({ zoneIds: assignedZoneIds });
  const todayVisits = await repo.getSalesBoyVisitsToday(salesBoyId);

  const availableCount = todayVisits.filter((v) => v.is_available).length;
  const closedCount = todayVisits.filter((v) => !v.is_available).length;

  let booksPitchedToday = 0;
  let booksBoughtToday = 0;

  todayVisits.forEach((v) => {
    (v.sales_visit_books || []).forEach((vb) => {
      if (vb.action_type === 'shown') booksPitchedToday++;
      if (vb.action_type === 'bought') booksBoughtToday++;
    });
  });

  const visitedVendorIds = new Set(todayVisits.map((v) => v.vendor_id));
  const uniqueShopsVisited = visitedVendorIds.size;
  const totalAssigned = assignedShops.length;
  const beatCoveragePercent = totalAssigned > 0 ? Math.min(100, Math.round((uniqueShopsVisited / totalAssigned) * 100)) : 0;

  return {
    todayAnalytics: {
      totalVisits: todayVisits.length,
      availableShops: availableCount,
      closedShops: closedCount,
      booksPitched: booksPitchedToday,
      booksBought: booksBoughtToday,
      uniqueShopsVisited,
      beatCoveragePercent
    },
    assignedZoneIds,
    assignedShopsCount: totalAssigned,
    recentVisits: todayVisits.slice(0, 5)
  };
}

// ------------------------------------------------------------------------------
// 7. ADMIN SALES ANALYTICS & COVERAGE REPORT
// ------------------------------------------------------------------------------

export async function getAdminSalesAnalytics({ zoneId } = {}) {
  const [allVendors, allVisits, allZones, allSalesBoys] = await Promise.all([
    repo.listVendors({ zoneId }),
    repo.listVisits({ zoneId, limit: 1000 }),
    repo.listZones(),
    repo.listSalesBoys()
  ]);

  // 1. Unique Shops (US) visited
  const visitedVendorIds = new Set(allVisits.map((v) => v.vendor_id));
  const uniqueShopsVisited = visitedVendorIds.size;
  const totalShops = allVendors.length;
  const coveragePercent = totalShops > 0 ? Math.round((uniqueShopsVisited / totalShops) * 100) : 0;

  // 2. Shops Not Visited (Coverage Gap)
  const unvisitedShops = allVendors.filter((vendor) => !visitedVendorIds.has(vendor.id));

  // 3. Books conversion metrics
  const bookConversionMap = new Map();
  allVisits.forEach((v) => {
    (v.sales_visit_books || []).forEach((vb) => {
      const book = vb.books;
      if (!book) return;
      if (!bookConversionMap.has(book.id)) {
        bookConversionMap.set(book.id, {
          bookId: book.id,
          bookName: book.name,
          bookCode: book.code,
          shownCount: 0,
          boughtCount: 0
        });
      }
      const item = bookConversionMap.get(book.id);
      if (vb.action_type === 'shown') item.shownCount++;
      if (vb.action_type === 'bought') item.boughtCount++;
    });
  });

  return {
    summary: {
      totalVisits: allVisits.length,
      uniqueShopsVisited,
      totalShops,
      coveragePercent,
      unvisitedShopsCount: unvisitedShops.length,
      totalSalesReps: allSalesBoys.length,
      totalZones: allZones.length
    },
    unvisitedShops: unvisitedShops.slice(0, 20),
    bookConversions: Array.from(bookConversionMap.values())
  };
}
