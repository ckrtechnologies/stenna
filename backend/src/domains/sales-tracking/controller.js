import logger from '../../utils/logger.js';
import * as service from './service.js';
import * as v from './validation.js';

/* ==============================================================================
 * Sales Tracking Controller
 * Validates HTTP inputs, delegates to Service, returns standardized JSON.
 * Includes structured backend terminal logging for diagnostics.
 * ============================================================================== */

function handleError(req, res, error, defaultStatus = 400) {
  const status = error.status || (error.name === 'ZodError' ? 400 : defaultStatus);
  const isZod = error.name === 'ZodError';
  const formattedMsg = isZod ? v.formatZodError(error) : error.message;

  logger.error(
    `[${req.method}] ${req.originalUrl || req.url} failed: ${formattedMsg}`,
    error,
    { body: req.body, query: req.query, params: req.params, userId: req.user?.id }
  );

  return res.status(status).json({
    success: false,
    message: formattedMsg,
    errors: error.errors || undefined
  });
}

// ------------------------------------------------------------------------------
// 1. AUTH (Sales Boy Login)
// ------------------------------------------------------------------------------

export async function login(req, res) {
  try {
    const input = v.salesBoyLoginBody.parse(req.body);
    const result = await service.loginSalesBoy(input);
    logger.success(`[POST] /login - Sales boy authenticated: ${result.user.name} (${result.user.phone})`);
    res.status(200).json(result);
  } catch (error) {
    handleError(req, res, error, 401);
  }
}

// ------------------------------------------------------------------------------
// 2. ZONE MASTER (Admin)
// ------------------------------------------------------------------------------

export async function createZone(req, res) {
  try {
    const input = v.createZoneBody.parse(req.body);
    const zone = await service.createZone(input);
    logger.success(`[POST] /admin/zones - Created zone '${zone.name}' (${zone.id})`);
    res.status(201).json({ message: 'Zone created successfully', data: zone });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function updateZone(req, res) {
  try {
    const { id } = req.params;
    const input = v.updateZoneBody.parse(req.body);
    const zone = await service.updateZone(id, input);
    logger.success(`[PUT] /admin/zones/${id} - Updated zone '${zone.name}'`);
    res.status(200).json({ message: 'Zone updated successfully', data: zone });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function listZones(req, res) {
  try {
    let zones = await service.listZones();
    if (req.user?.role === 'sales_boy') {
      const assignedIds = await service.getSalesBoyZoneIds(req.user.id);
      zones = zones.filter((z) => (assignedIds || []).includes(z.id));
    }
    res.status(200).json({ data: zones });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

export async function deleteZone(req, res) {
  try {
    const { id } = req.params;
    await service.deleteZone(id);
    logger.success(`[DELETE] /admin/zones/${id} - Deleted zone`);
    res.status(200).json({ message: 'Zone deleted successfully' });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

// ------------------------------------------------------------------------------
// 2b. MARKET MASTER (Admin & Mobile App)
// ------------------------------------------------------------------------------

export async function createMarket(req, res) {
  try {
    const input = v.createMarketBody.parse(req.body);
    const market = await service.createMarket(input);
    logger.success(`[POST] /admin/markets - Created market '${market.name}' (${market.id})`);
    res.status(201).json({ message: 'Market created successfully', data: market });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function updateMarket(req, res) {
  try {
    const { id } = req.params;
    const input = v.updateMarketBody.parse(req.body);
    const market = await service.updateMarket(id, input);
    logger.success(`[PUT] /admin/markets/${id} - Updated market '${market.name}'`);
    res.status(200).json({ message: 'Market updated successfully', data: market });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function listMarkets(req, res) {
  try {
    const { zoneId, isActive } = req.query;
    let filterZoneIds = undefined;
    let filterZoneId = zoneId;

    if (req.user?.role === 'sales_boy') {
      const assignedIds = await service.getSalesBoyZoneIds(req.user.id);
      if (!assignedIds || assignedIds.length === 0) {
        return res.status(200).json({ data: [] });
      }
      if (filterZoneId) {
        if (!assignedIds.includes(filterZoneId)) {
          return res.status(200).json({ data: [] });
        }
      } else {
        filterZoneIds = assignedIds;
      }
    }

    const markets = await service.listMarkets({
      zoneId: filterZoneId,
      zoneIds: filterZoneIds,
      isActive: isActive !== undefined ? isActive === 'true' : undefined
    });
    res.status(200).json({ data: markets });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

export async function deleteMarket(req, res) {
  try {
    const { id } = req.params;
    await service.deleteMarket(id);
    logger.success(`[DELETE] /admin/markets/${id} - Deleted market`);
    res.status(200).json({ message: 'Market deleted successfully' });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

// ------------------------------------------------------------------------------
// 3. VENDOR / RETAIL SHOPS MASTER (Admin & Mobile App)
// ------------------------------------------------------------------------------

export async function createVendor(req, res) {
  try {
    const input = v.createVendorBody.parse(req.body);
    const vendor = await service.createVendor(input);
    logger.success(`[POST] /admin/vendors - Created vendor '${vendor.shop_name}' (${vendor.id})`);
    res.status(201).json({ message: 'Vendor shop created successfully', data: vendor });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function bulkCreateVendors(req, res) {
  try {
    const input = v.bulkCreateVendorsBody.parse(req.body);
    const result = await service.bulkImportVendors(input.vendors, input.defaultZoneId, input.defaultMarketId);
    logger.success(`[POST] /admin/vendors/bulk - Imported ${result.insertedCount} vendors (Failed: ${result.failedCount})`);
    res.status(200).json({
      message: `Successfully imported ${result.insertedCount} vendor(s)${result.failedCount > 0 ? `, ${result.failedCount} rows failed` : ''}`,
      data: result
    });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function updateVendor(req, res) {
  try {
    const { id } = req.params;
    const input = v.updateVendorBody.parse(req.body);
    const vendor = await service.updateVendor(id, input);
    logger.success(`[PUT] /admin/vendors/${id} - Updated vendor '${vendor.shop_name}'`);
    res.status(200).json({ message: 'Vendor shop updated successfully', data: vendor });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function listVendors(req, res) {
  try {
    const { zoneId, marketId, search } = req.query;
    let filterZoneIds = undefined;
    let filterZoneId = zoneId;

    if (req.user?.role === 'sales_boy') {
      const assignedIds = await service.getSalesBoyZoneIds(req.user.id);
      if (!assignedIds || assignedIds.length === 0) {
        return res.status(200).json({ data: [] });
      }
      if (filterZoneId) {
        if (!assignedIds.includes(filterZoneId)) {
          return res.status(200).json({ data: [] });
        }
      } else {
        filterZoneIds = assignedIds;
      }
    }

    const vendors = await service.listVendors({
      zoneId: filterZoneId,
      marketId,
      search,
      zoneIds: filterZoneIds
    });
    res.status(200).json({ data: vendors });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

export async function getVendorWithHistory(req, res) {
  try {
    const { id } = req.params;
    const details = await service.getVendorDetailsWithHistory(id);
    res.status(200).json(details);
  } catch (error) {
    handleError(req, res, error, 404);
  }
}

export async function deleteVendor(req, res) {
  try {
    const { id } = req.params;
    await service.deleteVendor(id);
    logger.success(`[DELETE] /admin/vendors/${id} - Deleted vendor`);
    res.status(200).json({ message: 'Vendor shop deleted successfully' });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

// ------------------------------------------------------------------------------
// 4. SALES BOYS MANAGEMENT (Admin)
// ------------------------------------------------------------------------------

export async function createSalesBoy(req, res) {
  try {
    const input = v.createSalesBoyBody.parse(req.body);
    const salesBoy = await service.createSalesBoy(input);
    logger.success(`[POST] /admin/sales-boys - Created sales rep '${salesBoy.name}' (${salesBoy.id})`);
    res.status(201).json({ message: 'Sales boy registered successfully', data: salesBoy });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function updateSalesBoy(req, res) {
  try {
    const { id } = req.params;
    const input = v.updateSalesBoyBody.parse(req.body);
    const updated = await service.updateSalesBoy(id, input);
    logger.success(`[PUT] /admin/sales-boys/${id} - Updated sales rep '${updated.name}'`);
    res.status(200).json({ message: 'Sales boy updated successfully', data: updated });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function listSalesBoys(req, res) {
  try {
    const salesBoys = await service.listSalesBoys();
    res.status(200).json({ data: salesBoys });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

export async function deleteSalesBoy(req, res) {
  try {
    const { id } = req.params;
    await service.deleteSalesBoy(id);
    logger.success(`[DELETE] /admin/sales-boys/${id} - Deleted sales rep`);
    res.status(200).json({ message: 'Sales representative deleted successfully' });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

// ------------------------------------------------------------------------------
// 5. FIELD VISITS & VISIT RECORDING (Sales Boy & Admin)
// ------------------------------------------------------------------------------

export async function recordVisit(req, res) {
  try {
    const input = v.recordVisitBody.parse(req.body);
    const salesBoyId = req.user.id;
    const visit = await service.recordVisit({ salesBoyId, rawInput: input });
    logger.success(`[POST] /visits - Recorded visit to vendor '${visit.vendor_id}' by sales rep '${salesBoyId}'`);
    res.status(201).json({ message: 'Field visit recorded successfully', data: visit });
  } catch (error) {
    handleError(req, res, error, 400);
  }
}

export async function listVisits(req, res) {
  try {
    const { vendorId, zoneId, isAvailable, startDate, endDate, limit } = req.query;
    let salesBoyId = req.query.salesBoyId;
    if (req.user && req.user.role === 'sales_boy') {
      salesBoyId = req.user.id;
    }
    const visits = await service.listVisits({
      vendorId,
      salesBoyId,
      zoneId,
      isAvailable,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : 200
    });
    res.status(200).json({ data: visits });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

// ------------------------------------------------------------------------------
// 6. SALES BOY APP HOME DASHBOARD
// ------------------------------------------------------------------------------

export async function getAppDashboard(req, res) {
  try {
    const salesBoyId = req.user.id;
    const dashboard = await service.getSalesBoyAppDashboard(salesBoyId);
    res.status(200).json({ data: dashboard });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

// ------------------------------------------------------------------------------
// 7. ADMIN SALES ANALYTICS & COVERAGE REPORT
// ------------------------------------------------------------------------------

export async function getAdminAnalytics(req, res) {
  try {
    const { zoneId, startDate, endDate, datePreset } = req.query;
    const analytics = await service.getAdminSalesAnalytics({ zoneId, startDate, endDate, datePreset });
    res.status(200).json({ data: analytics });
  } catch (error) {
    handleError(req, res, error, 500);
  }
}

