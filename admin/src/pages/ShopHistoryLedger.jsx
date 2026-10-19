import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Store,
  History,
  MapPin,
  Phone,
  User,
  Search,
  Calendar,
  BookOpen,
  ShoppingBag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  UserCheck,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

export default function ShopHistoryLedger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialVendorId = searchParams.get('vendorId') || '';

  // Core Data
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [salesBoys, setSalesBoys] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Vendor & 360 History
  const [selectedVendorId, setSelectedVendorId] = useState(initialVendorId);
  const [vendorHistory, setVendorHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Global Ledger Visits (when not filtering by a single vendor or for cross-shop audit)
  const [visits, setVisits] = useState([]);

  // Filters State
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');
  const [bookFilter, setBookFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, CLOSED
  const [datePreset, setDatePreset] = useState('ALL'); // ALL, 7DAYS, 30DAYS, THIS_MONTH
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('visited_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load masters on mount
  useEffect(() => {
    fetchMasters();
  }, []);

  // Update selectedVendorId when query param changes
  useEffect(() => {
    const qVendorId = searchParams.get('vendorId') || '';
    if (qVendorId !== selectedVendorId) {
      setSelectedVendorId(qVendorId);
    }
  }, [searchParams]);

  // Load vendor history or visits when selected vendor or filters change
  useEffect(() => {
    if (selectedVendorId) {
      fetchVendorHistory(selectedVendorId);
    } else {
      fetchAllVisits();
    }
  }, [selectedVendorId]);

  const fetchMasters = async () => {
    setLoading(true);
    try {
      const [vRes, zRes, sbRes, bRes] = await Promise.all([
        api.get('/sales-tracking/vendors'),
        api.get('/sales-tracking/admin/zones'),
        api.get('/sales-tracking/admin/sales-boys'),
        api.get('/books').catch(() => ({ data: [] }))
      ]);

      setVendors(vRes.data?.data || []);
      setZones(zRes.data?.data || []);
      setSalesBoys(sbRes.data?.data || []);
      setBooks(Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load masters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorHistory = async (vendorId) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/sales-tracking/vendors/${vendorId}/history`);
      setVendorHistory(res.data);
      setVisits(res.data?.visits || []);
    } catch (err) {
      console.error('Failed to load shop history:', err);
      setVendorHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAllVisits = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/sales-tracking/visits?limit=300');
      setVisits(res.data?.data || []);
      setVendorHistory(null);
    } catch (err) {
      console.error('Failed to fetch visits:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handler when user picks a shop from the dropdown
  const handleSelectShop = (vId) => {
    setSelectedVendorId(vId);
    if (vId) {
      setSearchParams({ vendorId: vId });
    } else {
      setSearchParams({});
    }
  };

  // Filtered and Sorted Visits
  const processedVisits = useMemo(() => {
    return visits
      .filter((v) => {
        // Search term
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const shopName = (v.sales_vendors?.shop_name || '').toLowerCase();
          const repName = (v.sales_boys?.name || '').toLowerCase();
          const notes = (v.comments || '').toLowerCase();
          if (!shopName.includes(s) && !repName.includes(s) && !notes.includes(s)) {
            return false;
          }
        }

        // Zone Filter
        if (zoneFilter !== 'ALL') {
          const vZoneId = v.sales_vendors?.zone_id;
          if (vZoneId !== zoneFilter) return false;
        }

        // Sales Rep Filter
        if (repFilter !== 'ALL') {
          if (v.sales_boy_id !== repFilter) return false;
        }

        // Status Filter
        if (statusFilter === 'AVAILABLE' && !v.is_available) return false;
        if (statusFilter === 'CLOSED' && v.is_available) return false;

        // Book Filter (either shown or bought)
        if (bookFilter !== 'ALL') {
          const hasBook = (v.sales_visit_books || []).some((vb) => vb.book_id === bookFilter);
          if (!hasBook) return false;
        }

        // Date Presets
        if (datePreset !== 'ALL') {
          const vDate = new Date(v.visited_at);
          const now = new Date();
          if (datePreset === '7DAYS') {
            const d7 = new Date();
            d7.setDate(now.getDate() - 7);
            if (vDate < d7) return false;
          } else if (datePreset === '30DAYS') {
            const d30 = new Date();
            d30.setDate(now.getDate() - 30);
            if (vDate < d30) return false;
          } else if (datePreset === 'THIS_MONTH') {
            if (vDate.getMonth() !== now.getMonth() || vDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'visited_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (sortField === 'rep_name') {
          aVal = (a.sales_boys?.name || '').toLowerCase();
          bVal = (b.sales_boys?.name || '').toLowerCase();
        } else if (sortField === 'shop_name') {
          aVal = (a.sales_vendors?.shop_name || '').toLowerCase();
          bVal = (b.sales_vendors?.shop_name || '').toLowerCase();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [visits, searchTerm, zoneFilter, repFilter, statusFilter, bookFilter, datePreset, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown size={13} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ArrowUp size={13} color="var(--primary)" /> : <ArrowDown size={13} color="var(--primary)" />;
  };

  // Export current filtered ledger to CSV
  const handleExportCSV = () => {
    if (processedVisits.length === 0) {
      alert('No records to export');
      return;
    }

    const headers = ['Visit Date & Time,Shop Name,Phone,Zone,Sales Rep,Rep Phone,Shop Status,Books Pitched,Books Bought,Comments'];
    const rows = processedVisits.map((v) => {
      const date = new Date(v.visited_at).toLocaleString('en-IN');
      const shop = `"${(v.sales_vendors?.shop_name || '').replace(/"/g, '""')}"`;
      const phone = v.sales_vendors?.phone || '';
      const zone = `"${(v.sales_vendors?.sales_zones?.name || '').replace(/"/g, '""')}"`;
      const rep = `"${(v.sales_boys?.name || '').replace(/"/g, '""')}"`;
      const repPhone = v.sales_boys?.phone || '';
      const status = v.is_available ? 'Available' : 'Closed / Unavailable';
      const pitched = `"${(v.sales_visit_books || []).filter((b) => b.action_type === 'shown').map((b) => b.books?.name).join(' | ').replace(/"/g, '""')}"`;
      const bought = `"${(v.sales_visit_books || []).filter((b) => b.action_type === 'bought').map((b) => b.books?.name).join(' | ').replace(/"/g, '""')}"`;
      const comments = `"${(v.comments || '').replace(/"/g, '""')}"`;

      return [date, shop, phone, zone, rep, repPhone, status, pitched, bought, comments].join(',');
    });

    const csvData = headers.concat(rows).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shop_visit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Aggregated shop statistics when a vendor is selected
  const activeVendor = vendorHistory?.vendor || vendors.find((v) => v.id === selectedVendorId);
  const totalVisitsCount = visits.length;
  const availableVisitsCount = visits.filter((v) => v.is_available).length;
  const lastVisit = visits[0];
  const allShownBooks = vendorHistory?.bookHistory?.allShownBooks || [];
  const allBoughtBooks = vendorHistory?.bookHistory?.allBoughtBooks || [];

  const conversionRate = allShownBooks.length > 0
    ? Math.round((allBoughtBooks.length / allShownBooks.length) * 100)
    : 0;

  if (loading) return <Loader />;

  return (
    <div className="sales-tracking-page">
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => navigate('/sales-tracking/vendors')}>
              Retail Shops
            </span>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
              Booking History & Ledger
            </span>
          </div>
          <h1 className="page-title">Shop-Wise Booking History & Ledger</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Comprehensive 360° shop audit trail, catalog pitches, book conversions, and field visit logs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* FILTER & SELECTION PANEL */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Shop Selector Dropdown */}
          <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Select Retail Shop / Vendor
            </label>
            <CustomSelect
              value={selectedVendorId}
              onChange={(val) => handleSelectShop(val)}
              placeholder="-- All Retail Shops (Global Ledger) --"
              options={[
                { value: '', label: '-- All Retail Shops (Global Ledger) --' },
                ...vendors.map((v) => ({
                  value: v.id,
                  label: v.shop_name,
                  subtext: `${v.contact_person || 'Owner'} • ${v.phone || 'No phone'}`,
                  badge: v.sales_zones?.name || ''
                }))
              ]}
              searchable={true}
              searchPlaceholder="Search shop name, owner, phone..."
            />
          </div>

          {/* Territory Zone Filter */}
          <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Territory Zone
            </label>
            <CustomSelect
              value={zoneFilter}
              onChange={(val) => setZoneFilter(val)}
              placeholder="All Territories"
              options={[
                { value: 'ALL', label: 'All Territories' },
                ...zones.map((z) => ({ value: z.id, label: z.name }))
              ]}
              searchable={zones.length > 5}
              searchPlaceholder="Filter zones..."
            />
          </div>

          {/* Sales Rep Filter */}
          <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Sales Rep
            </label>
            <CustomSelect
              value={repFilter}
              onChange={(val) => setRepFilter(val)}
              placeholder="All Sales Reps"
              options={[
                { value: 'ALL', label: 'All Sales Reps' },
                ...salesBoys.map((sb) => ({
                  value: sb.id,
                  label: sb.name,
                  subtext: sb.phone || ''
                }))
              ]}
              searchable={salesBoys.length > 5}
              searchPlaceholder="Filter reps..."
            />
          </div>

          {/* Catalog Book Filter */}
          <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Pitched / Bought Book
            </label>
            <CustomSelect
              value={bookFilter}
              onChange={(val) => setBookFilter(val)}
              placeholder="All Wallpaper Books"
              options={[
                { value: 'ALL', label: 'All Wallpaper Books' },
                ...books.map((b) => ({
                  value: b.id,
                  label: b.name,
                  badge: b.code || ''
                }))
              ]}
              searchable={books.length > 5}
              searchPlaceholder="Filter books..."
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Shop Availability
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              placeholder="All Visits"
              options={[
                { value: 'ALL', label: 'All Visits' },
                { value: 'AVAILABLE', label: 'Available Only' },
                { value: 'CLOSED', label: 'Closed / Unavailable Only' }
              ]}
              searchable={false}
            />
          </div>

          {/* Date Preset Filter */}
          <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Timeframe
            </label>
            <CustomSelect
              value={datePreset}
              onChange={(val) => setDatePreset(val)}
              placeholder="All Time"
              options={[
                { value: 'ALL', label: 'All Time' },
                { value: '7DAYS', label: 'Last 7 Days' },
                { value: '30DAYS', label: 'Last 30 Days' },
                { value: 'THIS_MONTH', label: 'This Month' }
              ]}
              searchable={false}
            />
          </div>
        </div>

        {/* Search bar & reset filter */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by keywords, notes, shop name, or sales rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.4rem',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem',
                fontSize: '0.82rem'
              }}
            />
          </div>

          {(selectedVendorId || zoneFilter !== 'ALL' || repFilter !== 'ALL' || bookFilter !== 'ALL' || statusFilter !== 'ALL' || datePreset !== 'ALL' || searchTerm) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedVendorId('');
                setSearchParams({});
                setZoneFilter('ALL');
                setRepFilter('ALL');
                setBookFilter('ALL');
                setStatusFilter('ALL');
                setDatePreset('ALL');
                setSearchTerm('');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <RotateCcw size={14} />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* SHOP 360° KPI BANNER (Rendered when a specific shop is selected) */}
      {activeVendor && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {/* Shop Details Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div className="menu-squircle-badge" style={{ backgroundColor: '#10b981', width: 28, height: 28 }}>
                <Store size={15} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{activeVendor.shop_name}</h3>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> {activeVendor.contact_person || 'Owner'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={13} /> {activeVendor.phone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} /> {activeVendor.shop_address || 'Address not listed'}
              </span>
            </div>
          </div>

          {/* Visits KPI */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Field Visits Logged
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {totalVisitsCount}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                {availableVisitsCount} available
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {lastVisit ? `Last visit: ${new Date(lastVisit.visited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No visits yet'}
            </span>
          </div>

          {/* Unique Sample Books Pitched */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Books Ever Pitched
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>
                {allShownBooks.length}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                catalogs demonstrated
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Out of {books.length} active collection books
            </span>
          </div>

          {/* Books Bought / Converted */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Catalog Purchase Rate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
                {conversionRate}%
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ({allBoughtBooks.length} bought)
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(conversionRate, 100)}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLIDATED CATALOG DISTRIBUTION SUMMARY CARDS (When a vendor is selected) */}
      {activeVendor && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {/* Pitched / Shown Books */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BookOpen size={16} color="#3b82f6" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                Sample Books Ever Pitched / Shown ({allShownBooks.length})
              </h4>
            </div>
            {allShownBooks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No sample books pitched to this shop yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {allShownBooks.map((b) => (
                  <span key={b.id} className="book-badge-chip shown" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}>
                    📖 {b.name} {b.code ? `(${b.code})` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bought / Ordered Books */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShoppingBag size={16} color="#10b981" />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                Books Ever Bought / Ordered ({allBoughtBooks.length})
              </h4>
            </div>
            {allBoughtBooks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No books purchased yet by this retailer.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {allBoughtBooks.map((b) => (
                  <span key={b.id} className="book-badge-chip bought" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}>
                    🛍️ {b.name} {b.code ? `(${b.code})` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL VISIT & BOOKING LEDGER TABLE */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            {selectedVendorId ? 'Shop Visit & Booking Ledger' : 'Global Field Visit Audit Log'}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              ({processedVisits.length} record{processedVisits.length === 1 ? '' : 's'})
            </span>
          </h3>
        </div>

        {historyLoading ? (
          <Loader />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <div className="table-sort-header" onClick={() => handleSort('visited_at')}>
                      <span>Visit Date & Time</span> {renderSortIndicator('visited_at')}
                    </div>
                  </th>
                  {!selectedVendorId && (
                    <th>
                      <div className="table-sort-header" onClick={() => handleSort('shop_name')}>
                        <span>Retail Shop</span> {renderSortIndicator('shop_name')}
                      </div>
                    </th>
                  )}
                  <th>
                    <div className="table-sort-header" onClick={() => handleSort('rep_name')}>
                      <span>Sales Rep</span> {renderSortIndicator('rep_name')}
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Sample Books Pitched</th>
                  <th>Books Bought</th>
                  <th>Remarks / Notes</th>
                </tr>
              </thead>
              <tbody>
                {processedVisits.length === 0 ? (
                  <tr>
                    <td colSpan={selectedVendorId ? 6 : 7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No field visits match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  processedVisits.map((v) => {
                    const shownBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'shown');
                    const boughtBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'bought');

                    return (
                      <tr key={v.id}>
                        {/* Visit Date */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(v.visited_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(v.visited_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        {/* Retail Shop (If viewing global ledger) */}
                        {!selectedVendorId && (
                          <td>
                            <div
                              style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                              onClick={() => handleSelectShop(v.vendor_id)}
                              title="Click to view shop 360 history"
                            >
                              {v.sales_vendors?.shop_name || 'Retail Shop'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {v.sales_vendors?.contact_person} • {v.sales_vendors?.sales_zones?.name || 'Unassigned'}
                            </div>
                          </td>
                        )}

                        {/* Sales Rep */}
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {v.sales_boys?.name || 'Sales Rep'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {v.sales_boys?.phone}
                          </div>
                        </td>

                        {/* Availability Status */}
                        <td>
                          <span className={`status-tag ${v.is_available ? 'available' : 'unavailable'}`}>
                            {v.is_available ? 'Available' : 'Closed / Unavailable'}
                          </span>
                        </td>

                        {/* Books Pitched */}
                        <td>
                          {shownBooks.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '240px' }}>
                              {shownBooks.map((vb) => (
                                <span key={vb.id} className="book-badge-chip shown">
                                  {vb.books?.name || 'Catalog'}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Books Bought */}
                        <td>
                          {boughtBooks.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '240px' }}>
                              {boughtBooks.map((vb) => (
                                <span key={vb.id} className="book-badge-chip bought">
                                  {vb.books?.name || 'Book'}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Notes */}
                        <td style={{ maxWidth: '260px' }}>
                          {v.comments ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                              "{v.comments}"
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
