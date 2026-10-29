import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Papa from 'papaparse';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Store,
  History,
  MapPin,
  Phone,
  User,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  UploadCloud,
  Download,
  FileSpreadsheet,
  Building2,
  Clock,
  Check
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

export default function Vendors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [vendorVisitsMap, setVendorVisitsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(searchParams.get('zoneId') || 'ALL');
  const [marketFilter, setMarketFilter] = useState(searchParams.get('marketId') || 'ALL');
  const [visitStatusFilter, setVisitStatusFilter] = useState(searchParams.get('visitStatus') || 'ALL');

  // Sorting state
  const [sortField, setSortField] = useState('shop_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    shopAddress: '',
    contactPerson: '',
    zoneId: '',
    marketId: '',
    isActive: true
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Bulk CSV Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedRows, setBulkParsedRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkDefaultZoneId, setBulkDefaultZoneId] = useState('');
  const [bulkDefaultMarketId, setBulkDefaultMarketId] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Sync state with search params changes
  useEffect(() => {
    const qVisitStatus = searchParams.get('visitStatus');
    if (qVisitStatus && qVisitStatus !== visitStatusFilter) {
      setVisitStatusFilter(qVisitStatus);
    }
    const qZone = searchParams.get('zoneId');
    if (qZone && qZone !== zoneFilter) {
      setZoneFilter(qZone);
    }
    const qMarket = searchParams.get('marketId');
    if (qMarket && qMarket !== marketFilter) {
      setMarketFilter(qMarket);
    }
  }, [searchParams]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vRes, zRes, mRes, visitsRes] = await Promise.all([
        api.get('/sales-tracking/vendors'),
        api.get('/sales-tracking/admin/zones'),
        api.get('/sales-tracking/admin/markets'),
        api.get('/sales-tracking/visits?limit=2000').catch(() => ({ data: { data: [] } }))
      ]);

      setVendors(vRes.data?.data || []);
      setZones(zRes.data?.data || []);
      setMarkets(mRes.data?.data || []);

      const visitCounts = {};
      (visitsRes.data?.data || []).forEach((visit) => {
        if (visit.vendor_id) {
          visitCounts[visit.vendor_id] = (visitCounts[visit.vendor_id] || 0) + 1;
        }
      });
      setVendorVisitsMap(visitCounts);
    } catch (err) {
      console.error('Failed to load vendors, zones, markets, or visits', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="sort-icon" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="sort-icon active" />
      : <ArrowDown size={12} className="sort-icon active" />;
  };

  const filteredAndSortedVendors = useMemo(() => {
    return vendors
      .filter((v) => {
        if (zoneFilter !== 'ALL' && v.zone_id !== zoneFilter) return false;
        if (marketFilter !== 'ALL' && v.market_id !== marketFilter) return false;

        // Visit status filtering (Stores Reached vs Stores Pending Visit)
        const visitCount = vendorVisitsMap[v.id] || 0;
        if (visitStatusFilter === 'VISITED' && visitCount === 0) return false;
        if (visitStatusFilter === 'UNVISITED' && visitCount > 0) return false;

        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchName = v.shop_name?.toLowerCase().includes(s);
          const matchContact = v.contact_person?.toLowerCase().includes(s);
          const matchPhone = v.phone?.includes(s);
          const matchMarket = v.sales_markets?.name?.toLowerCase().includes(s);
          if (!matchName && !matchContact && !matchPhone && !matchMarket) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        if (sortField === 'sales_zones') {
          aVal = a.sales_zones?.name || '';
          bVal = b.sales_zones?.name || '';
        }
        if (sortField === 'sales_markets') {
          aVal = a.sales_markets?.name || '';
          bVal = b.sales_markets?.name || '';
        }
        if (sortField === 'visits') {
          aVal = vendorVisitsMap[a.id] || 0;
          bVal = vendorVisitsMap[b.id] || 0;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [vendors, zoneFilter, marketFilter, visitStatusFilter, vendorVisitsMap, searchTerm, sortField, sortOrder]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      shopName: '',
      phone: '',
      shopAddress: '',
      contactPerson: '',
      zoneId: zones[0]?.id || '',
      marketId: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      shopName: vendor.shop_name,
      phone: vendor.phone,
      shopAddress: vendor.shop_address,
      contactPerson: vendor.contact_person,
      zoneId: vendor.zone_id || '',
      marketId: vendor.market_id || '',
      isActive: vendor.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    try {
      if (editingVendor) {
        const res = await api.put(`/sales-tracking/admin/vendors/${editingVendor.id}`, formData);
        setVendors((prev) =>
          prev.map((v) => (v.id === editingVendor.id ? { ...v, ...res.data?.data } : v))
        );
      } else {
        const res = await api.post('/sales-tracking/admin/vendors', formData);
        setVendors((prev) => [res.data?.data, ...prev]);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;
    try {
      await api.delete(`/sales-tracking/admin/vendors/${id}`);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenHistory = (vendor) => {
    navigate(`/sales-tracking/shop-history?vendorId=${vendor.id}`);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'Shop Name,Phone Number,Shop Address,Contact Person,Zone Name,Market Name\n' +
      'Royal Wall Decor,9876543210,14 Connaught Place Market New Delhi,Rajesh Sharma,Central Delhi,Connaught Place\n' +
      'Elegance Wallpapers,9811223344,Plot 45 Sector 18 Noida,Sunil Verma,Noida,Sector 18 Market\n' +
      'Classic Home Interiors,9899001122,Shop 12 MG Road Gurgaon,Anil Mehta,Gurgaon,Sikanderpur Marble Market\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vendors_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data || [];
        const parsed = [];
        const errs = [];

        rows.forEach((row, idx) => {
          const shopName = String(row['Shop Name'] || row.shop_name || row.shopName || row.name || row.Shop || '').trim();
          const rawPhone = String(row['Phone Number'] || row['Phone'] || row.phone || row.phoneNumber || row.mobile || '').replace(/\D/g, '').trim();
          const phone = rawPhone.length === 12 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;
          const shopAddress = String(row['Shop Address'] || row['Address'] || row.shop_address || row.shopAddress || row.address || '').trim();
          const contactPerson = String(row['Contact Person'] || row['Owner Name'] || row.contact_person || row.contactPerson || row.owner || '').trim();
          const zoneName = String(row['Zone Name'] || row['Zone'] || row.zone_name || row.zoneName || row.zone || '').trim();
          const marketName = String(row['Market Name'] || row['Market'] || row.market_name || row.marketName || row.market || '').trim();

          const missingFields = [];
          if (!shopName) missingFields.push('Shop Name');
          if (!phone || phone.length < 10) missingFields.push('10-digit Phone');
          if (!shopAddress) missingFields.push('Shop Address');
          if (!contactPerson) missingFields.push('Contact Person');

          if (missingFields.length > 0) {
            errs.push({
              row: idx + 2,
              shopName: shopName || '(Unknown)',
              reason: `Missing: ${missingFields.join(', ')}`
            });
          } else {
            parsed.push({
              shopName,
              phone,
              shopAddress,
              contactPerson,
              zoneName,
              marketName
            });
          }
        });

        setBulkParsedRows(parsed);
        setBulkErrors(errs);
      },
      error: (err) => {
        alert('Failed to parse CSV file: ' + err.message);
      }
    });
  };

  const handleBulkImportSubmit = async () => {
    if (bulkParsedRows.length === 0) return;
    setBulkImporting(true);
    try {
      const res = await api.post('/sales-tracking/admin/vendors/bulk', {
        vendors: bulkParsedRows,
        defaultZoneId: bulkDefaultZoneId || null,
        defaultMarketId: bulkDefaultMarketId || null
      });

      setBulkResult(res.data?.data);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBulkImporting(false);
    }
  };

  return (
    <div className="sales-tracking-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="page-title">Vendor / Retail Shops Master</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage wallpaper retail shops, map them to sales territories, and inspect visit histories.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleDownloadTemplate}
            title="Download CSV sample format"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Download size={15} />
            <span>Sample CSV</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setBulkFile(null);
              setBulkParsedRows([]);
              setBulkErrors([]);
              setBulkResult(null);
              setBulkDefaultZoneId(zones[0]?.id || '');
              setIsBulkModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', borderColor: '#3b82f6', color: 'var(--primary)' }}
          >
            <UploadCloud size={15} />
            <span>Import CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add New Shop</span>
          </button>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by shop name, contact person, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.5rem',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
          <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <CustomSelect
            value={zoneFilter}
            onChange={(val) => {
              setZoneFilter(val);
              setMarketFilter('ALL');
            }}
            placeholder="All Territories"
            options={[
              { value: 'ALL', label: 'All Territories / Zones' },
              ...zones.map((z) => ({ value: z.id, label: z.name }))
            ]}
            searchable={zones.length > 5}
            searchPlaceholder="Search zones..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
          <Building2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <CustomSelect
            value={marketFilter}
            onChange={(val) => setMarketFilter(val)}
            placeholder="All Markets"
            options={[
              { value: 'ALL', label: 'All Markets / Bazaars' },
              ...markets
                .filter((m) => zoneFilter === 'ALL' || m.zone_id === zoneFilter)
                .map((m) => ({ value: m.id, label: m.name }))
            ]}
            searchable={markets.length > 5}
            searchPlaceholder="Search markets..."
          />
        </div>

        {/* Visit Status Filter Pills (All / Reached / Pending) */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Shops (${vendors.length})` },
            {
              id: 'VISITED',
              label: `✓ Reached (${vendors.filter((v) => vendorVisitsMap[v.id]).length})`,
              activeColor: '#10b981'
            },
            {
              id: 'UNVISITED',
              label: `⏳ Pending Visit (${vendors.filter((v) => !vendorVisitsMap[v.id]).length})`,
              activeColor: '#f59e0b'
            }
          ].map((pill) => {
            const active = visitStatusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setVisitStatusFilter(pill.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.76rem',
                  borderRadius: '6px',
                  border: active
                    ? `1px solid ${pill.activeColor || 'var(--primary)'}`
                    : '1px solid var(--border-color)',
                  background: active
                    ? pill.activeColor
                      ? `${pill.activeColor}1a`
                      : 'rgba(59, 130, 246, 0.12)'
                    : 'var(--bg-card)',
                  color: active
                    ? pill.activeColor || 'var(--primary)'
                    : 'var(--text-muted)',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {(searchTerm || zoneFilter !== 'ALL' || marketFilter !== 'ALL' || visitStatusFilter !== 'ALL') && (
          <button
            className="btn"
            style={{ background: 'var(--border-color)', color: 'var(--text-main)', fontSize: '0.78rem', padding: '0.4rem 0.65rem' }}
            onClick={() => {
              setSearchTerm('');
              setZoneFilter('ALL');
              setMarketFilter('ALL');
              setVisitStatusFilter('ALL');
              setSearchParams({});
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Vendors Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                <th style={{ width: '180px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('shop_name')}>
                    <span>Shop Name</span> {renderSortIndicator('shop_name')}
                  </div>
                </th>
                <th style={{ width: '130px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('contact_person')}>
                    <span>Contact Person</span> {renderSortIndicator('contact_person')}
                  </div>
                </th>
                <th style={{ width: '120px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('phone')}>
                    <span>Phone</span> {renderSortIndicator('phone')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('shop_address')}>
                    <span>Address</span> {renderSortIndicator('shop_address')}
                  </div>
                </th>
                <th style={{ width: '130px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('sales_zones')}>
                    <span>Territory / Zone</span> {renderSortIndicator('sales_zones')}
                  </div>
                </th>
                <th style={{ width: '140px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('sales_markets')}>
                    <span>Market / Bazaar</span> {renderSortIndicator('sales_markets')}
                  </div>
                </th>
                <th style={{ width: '115px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('visits')}>
                    <span>Visit Reach</span> {renderSortIndicator('visits')}
                  </div>
                </th>
                <th style={{ width: '95px', textAlign: 'center' }}>
                  <div className="table-sort-header" style={{ justifyContent: 'center' }} onClick={() => handleSort('is_active')}>
                    <span>Status</span> {renderSortIndicator('is_active')}
                  </div>
                </th>
                <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedVendors.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No retail shops found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedVendors.map((vendor, index) => (
                  <tr key={vendor.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{index + 1}
                      </span>
                    </td>
                    <td>
                      <div className="table-cell-inline" style={{ maxWidth: '100%' }} title={vendor.shop_name}>
                        <Store size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {vendor.shop_name}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-ellipsis" title={vendor.contact_person}>
                        {vendor.contact_person || '—'}
                      </div>
                    </td>
                    <td>
                      <a
                        href={`tel:${vendor.phone}`}
                        style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontVariantNumeric: 'tabular-nums' }}
                      >
                        <Phone size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span>{vendor.phone}</span>
                      </a>
                    </td>
                    <td>
                      <div
                        className="table-cell-ellipsis"
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                        title={vendor.shop_address || '—'}
                      >
                        {vendor.shop_address || '—'}
                      </div>
                    </td>
                    <td>
                      <span className="book-badge-chip" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={vendor.sales_zones?.name || 'Unassigned'}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {vendor.sales_zones?.name || 'Unassigned'}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="book-badge-chip" style={{ background: 'rgba(13, 148, 136, 0.12)', color: '#14b8a6', borderColor: 'rgba(13, 148, 136, 0.25)', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={vendor.sales_markets?.name || 'Unassigned'}>
                        <Building2 size={12} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {vendor.sales_markets?.name || 'Unassigned'}
                        </span>
                      </span>
                    </td>
                    <td>
                      {vendorVisitsMap[vendor.id] ? (
                        <span
                          className="badge badge-success"
                          title={`${vendorVisitsMap[vendor.id]} recorded field visit(s). Click to inspect ledger.`}
                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenHistory(vendor)}
                        >
                          <Check size={12} />
                          <span>Reached ({vendorVisitsMap[vendor.id]})</span>
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Clock size={12} />
                          <span>Pending Visit</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-tag ${vendor.is_active ? 'active' : 'inactive'}`}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="icon-btn"
                          title="View Shop-Wise Booking History"
                          onClick={() => handleOpenHistory(vendor)}
                        >
                          <History size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Edit Shop"
                          onClick={() => handleOpenEdit(vendor)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="icon-btn red"
                          title="Delete Shop"
                          onClick={() => handleDeleteVendor(vendor.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Shop Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVendor ? 'Edit Retail Shop' : 'Add New Retail Shop'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveVendor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Decor Emporium"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakesh Sharma"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Shop Address *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Shop No, Market Road, Landmark, City..."
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Assigned Territory / Zone (Tier 1)
                  </label>
                  <CustomSelect
                    value={formData.zoneId}
                    onChange={(val) => setFormData({ ...formData, zoneId: val, marketId: '' })}
                    placeholder="Unassigned"
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...zones.map((z) => ({ value: z.id, label: z.name }))
                    ]}
                    searchable={zones.length > 5}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Assigned Market / Bazaar (Tier 2)
                  </label>
                  <CustomSelect
                    value={formData.marketId}
                    onChange={(val) => setFormData({ ...formData, marketId: val })}
                    placeholder="Select Market"
                    options={[
                      { value: '', label: 'Unassigned Market' },
                      ...markets
                        .filter((m) => !formData.zoneId || m.zone_id === formData.zoneId)
                        .map((m) => ({ value: m.id, label: m.name }))
                    ]}
                    searchable={markets.length > 5}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveVendor"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isActiveVendor" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Active Vendor (Available for sales visits)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--border-color)', color: 'var(--text-main)' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalSaving}>
                  {modalSaving ? 'Saving...' : editingVendor ? 'Update Shop' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="modal-overlay" onClick={() => !bulkImporting && setIsBulkModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '640px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="menu-squircle-badge" style={{ backgroundColor: '#2563eb' }}>
                  <FileSpreadsheet size={16} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Bulk Import Retail Shops</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Upload a .csv file to batch insert wallpaper stores and retail counters
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => !bulkImporting && setIsBulkModalOpen(false)}
                disabled={bulkImporting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {bulkResult ? (
                /* Success View */
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Import Completed!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Successfully imported <strong>{bulkResult.insertedCount}</strong> new retail shop(s).
                    {bulkResult.failedCount > 0 && (
                      <span style={{ color: '#ef4444', display: 'block', marginTop: '0.25rem' }}>
                        {bulkResult.failedCount} rows could not be inserted due to validation issues.
                      </span>
                    )}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setIsBulkModalOpen(false);
                      setBulkResult(null);
                    }}
                    style={{ margin: '0 auto' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Upload & Preview View */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                        Default Zone (Tier 1)
                      </label>
                      <CustomSelect
                        value={bulkDefaultZoneId}
                        onChange={(val) => {
                          setBulkDefaultZoneId(val);
                          setBulkDefaultMarketId('');
                        }}
                        placeholder="-- No Default Zone --"
                        options={[
                          { value: '', label: '-- No Default Zone --' },
                          ...zones.map((z) => ({ value: z.id, label: z.name }))
                        ]}
                        searchable={zones.length > 5}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                        Default Market (Tier 2)
                      </label>
                      <CustomSelect
                        value={bulkDefaultMarketId}
                        onChange={(val) => setBulkDefaultMarketId(val)}
                        placeholder="-- No Default Market --"
                        options={[
                          { value: '', label: '-- No Default Market --' },
                          ...markets
                            .filter((m) => !bulkDefaultZoneId || m.zone_id === bulkDefaultZoneId)
                            .map((m) => ({ value: m.id, label: m.name }))
                        ]}
                        searchable={markets.length > 5}
                      />
                    </div>
                  </div>

                  {/* Drop area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '8px',
                      padding: '1.75rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(59, 130, 246, 0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      {bulkFile ? bulkFile.name : 'Click to select or drop CSV file'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Accepted format: <code>.csv</code> with headers (Shop Name, Phone, Address, Contact Person, Zone)
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: 0
                      }}
                    >
                      <Download size={13} />
                      <span>Download Sample CSV Template</span>
                    </button>
                    {bulkFile && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(bulkFile.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>

                  {/* Preview summary chips */}
                  {bulkFile && (
                    <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                        <span>
                          Total Detected: <strong>{bulkParsedRows.length + bulkErrors.length}</strong>
                        </span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          ✓ Valid: {bulkParsedRows.length}
                        </span>
                        {bulkErrors.length > 0 && (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            ⚠ Invalid: {bulkErrors.length}
                          </span>
                        )}
                      </div>

                      {/* Preview Table of First 3 rows */}
                      {bulkParsedRows.length > 0 && (
                        <div style={{ marginTop: '0.65rem', overflowX: 'auto' }}>
                          <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '4px 8px' }}>Shop Name</th>
                                <th style={{ padding: '4px 8px' }}>Phone</th>
                                <th style={{ padding: '4px 8px' }}>Contact</th>
                                <th style={{ padding: '4px 8px' }}>Zone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bulkParsedRows.slice(0, 3).map((r, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '4px 8px', fontWeight: 500 }}>{r.shopName}</td>
                                  <td style={{ padding: '4px 8px', color: 'var(--text-muted)' }}>{r.phone}</td>
                                  <td style={{ padding: '4px 8px' }}>{r.contactPerson}</td>
                                  <td style={{ padding: '4px 8px' }}>{r.zoneName || 'Default'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {bulkParsedRows.length > 3 && (
                            <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                              + {bulkParsedRows.length - 3} more shops ready to import
                            </p>
                          )}
                        </div>
                      )}

                      {/* Error rows warning */}
                      {bulkErrors.length > 0 && (
                        <div style={{ marginTop: '0.5rem', maxHeight: '70px', overflowY: 'auto', fontSize: '0.72rem', color: '#ef4444' }}>
                          {bulkErrors.slice(0, 3).map((err, i) => (
                            <div key={i}>Row {err.row} ({err.shopName}): {err.reason}</div>
                          ))}
                          {bulkErrors.length > 3 && <div>... and {bulkErrors.length - 3} more skipped rows</div>}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {!bulkResult && (
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsBulkModalOpen(false)}
                  disabled={bulkImporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBulkImportSubmit}
                  disabled={bulkImporting || bulkParsedRows.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {bulkImporting ? 'Importing...' : `Import ${bulkParsedRows.length} Shop(s)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
