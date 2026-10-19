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
  UserCheck,
  Clock,
  Layers,
  ChevronRight,
  X,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

// Helper for local calendar date comparisons (YYYY-MM-DD)
const toLocalDateStr = (d) => {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ShopHistoryLedger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialVendorId = searchParams.get('vendorId') || '';

  // Core Data
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [markets, setMarkets] = useState([]);
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
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState('ALL');
  const [bookFilter, setBookFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, CLOSED
  const [activityFilter, setActivityFilter] = useState(searchParams.get('activity') || 'ALL'); // ALL, ORDERED, PITCHED, BOTH, NONE
  const [datePreset, setDatePreset] = useState(searchParams.get('datePreset') || (searchParams.get('startDate') ? 'CUSTOM' : 'ALL')); // ALL, TODAY, 7DAYS, 30DAYS, THIS_MONTH, CUSTOM
  const [customStartDate, setCustomStartDate] = useState(searchParams.get('startDate') || '');
  const [customEndDate, setCustomEndDate] = useState(searchParams.get('endDate') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState('visited_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (zoneFilter !== 'ALL') count++;
    if (marketFilter !== 'ALL') count++;
    if (repFilter !== 'ALL') count++;
    if (bookFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    if (activityFilter !== 'ALL') count++;
    if (datePreset !== 'ALL' || customStartDate || customEndDate) count++;
    if (searchTerm.trim()) count++;
    if (selectedVendorId) count++;
    return count;
  }, [zoneFilter, marketFilter, repFilter, bookFilter, statusFilter, activityFilter, datePreset, customStartDate, customEndDate, searchTerm, selectedVendorId]);

  // Load masters on mount
  useEffect(() => {
    fetchMasters();
  }, []);

  // Update state when query params change
  useEffect(() => {
    const qVendorId = searchParams.get('vendorId') || '';
    if (qVendorId !== selectedVendorId) {
      setSelectedVendorId(qVendorId);
    }
    const qPreset = searchParams.get('datePreset');
    if (qPreset && qPreset !== datePreset) {
      setDatePreset(qPreset);
    }
    const qStartDate = searchParams.get('startDate');
    if (qStartDate !== null && qStartDate !== customStartDate) {
      setCustomStartDate(qStartDate);
      if (!qPreset && qStartDate) setDatePreset('CUSTOM');
    }
    const qEndDate = searchParams.get('endDate');
    if (qEndDate !== null && qEndDate !== customEndDate) {
      setCustomEndDate(qEndDate);
      if (!qPreset && qEndDate) setDatePreset('CUSTOM');
    }
    const qZoneId = searchParams.get('zoneId');
    if (qZoneId && qZoneId !== zoneFilter) {
      setZoneFilter(qZoneId);
    }
    const qMarketId = searchParams.get('marketId');
    if (qMarketId && qMarketId !== marketFilter) {
      setMarketFilter(qMarketId);
    }
    const qRepId = searchParams.get('repId');
    if (qRepId && qRepId !== repFilter) {
      setRepFilter(qRepId);
    }
    const qActivity = searchParams.get('activity');
    if (qActivity && qActivity !== activityFilter) {
      setActivityFilter(qActivity);
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
      const [vRes, zRes, mRes, sbRes, bRes] = await Promise.all([
        api.get('/sales-tracking/vendors'),
        api.get('/sales-tracking/admin/zones'),
        api.get('/sales-tracking/admin/markets').catch(() => ({ data: { data: [] } })),
        api.get('/sales-tracking/admin/sales-boys'),
        api.get('/books').catch(() => ({ data: [] }))
      ]);

      setVendors(vRes.data?.data || []);
      setZones(zRes.data?.data || []);
      setMarkets(mRes.data?.data || []);
      setSalesBoys(sbRes.data?.data || []);
      setBooks(Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load masters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter markets based on active zone filter
  const filteredMarkets = useMemo(() => {
    if (zoneFilter === 'ALL') return markets;
    return markets.filter((m) => m.zone_id === zoneFilter);
  }, [markets, zoneFilter]);

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
    const nextParams = new URLSearchParams(searchParams);
    if (vId) {
      nextParams.set('vendorId', vId);
    } else {
      nextParams.delete('vendorId');
    }
    setSearchParams(nextParams);
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

        // Market Filter
        if (marketFilter !== 'ALL') {
          const vMarketId = v.sales_vendors?.market_id;
          if (vMarketId !== marketFilter) return false;
        }

        // Sales Rep Filter
        if (repFilter !== 'ALL') {
          if (v.sales_boy_id !== repFilter) return false;
        }

        // Status Filter
        if (statusFilter === 'AVAILABLE' && !v.is_available) return false;
        if (statusFilter === 'CLOSED' && v.is_available) return false;

        // Activity / Outcome Filter (Ordered vs Pitched)
        const visitBooks = v.sales_visit_books || [];
        const hasOrdered = visitBooks.some((vb) => vb.action_type === 'bought');
        const hasPitched = visitBooks.some((vb) => vb.action_type === 'shown');

        if (activityFilter === 'ORDERED' && !hasOrdered) return false;
        if (activityFilter === 'PITCHED' && !hasPitched) return false;
        if (activityFilter === 'BOTH' && (!hasOrdered || !hasPitched)) return false;
        if (activityFilter === 'NONE' && (hasOrdered || hasPitched)) return false;

        // Book Filter (either shown or bought)
        if (bookFilter !== 'ALL') {
          const hasBook = visitBooks.some((vb) => vb.book_id === bookFilter);
          if (!hasBook) return false;
        }

        // Date Presets & Custom Date Range (compared strictly against local calendar YYYY-MM-DD)
        const visitDateStr = toLocalDateStr(v.visited_at);
        const now = new Date();
        const todayStr = toLocalDateStr(now);

        if (datePreset === 'TODAY') {
          if (visitDateStr !== todayStr) return false;
        } else if (datePreset === '7DAYS') {
          const d7 = new Date();
          d7.setDate(now.getDate() - 7);
          const d7Str = toLocalDateStr(d7);
          if (visitDateStr < d7Str) return false;
        } else if (datePreset === '30DAYS') {
          const d30 = new Date();
          d30.setDate(now.getDate() - 30);
          const d30Str = toLocalDateStr(d30);
          if (visitDateStr < d30Str) return false;
        } else if (datePreset === 'THIS_MONTH') {
          const vDate = new Date(v.visited_at);
          if (vDate.getMonth() !== now.getMonth() || vDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (datePreset === 'CUSTOM' || customStartDate || customEndDate) {
          if (customStartDate && visitDateStr < customStartDate) return false;
          if (customEndDate && visitDateStr > customEndDate) return false;
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
  }, [visits, searchTerm, zoneFilter, marketFilter, repFilter, statusFilter, bookFilter, activityFilter, datePreset, customStartDate, customEndDate, sortField, sortOrder]);

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

    const headers = ['Visit Date & Time,Shop Name,Phone,Zone,Sales Rep,Rep Phone,Books Pitched,Books Bought,Comments'];
    const rows = processedVisits.map((v) => {
      const date = new Date(v.visited_at).toLocaleString('en-IN');
      const shop = `"${(v.sales_vendors?.shop_name || '').replace(/"/g, '""')}"`;
      const phone = v.sales_vendors?.phone || '';
      const zone = `"${(v.sales_vendors?.sales_zones?.name || '').replace(/"/g, '""')}"`;
      const rep = `"${(v.sales_boys?.name || '').replace(/"/g, '""')}"`;
      const repPhone = v.sales_boys?.phone || '';
      const pitched = `"${(v.sales_visit_books || []).filter((b) => b.action_type === 'shown').map((b) => b.books?.name).join(' | ').replace(/"/g, '""')}"`;
      const bought = `"${(v.sales_visit_books || []).filter((b) => b.action_type === 'bought').map((b) => b.books?.name).join(' | ').replace(/"/g, '""')}"`;
      const comments = `"${(v.comments || '').replace(/"/g, '""')}"`;

      return [date, shop, phone, zone, rep, repPhone, pitched, bought, comments].join(',');
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

      {/* SOPHISTICATED FILTER & AUDIT TOOLBAR */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        {/* Main Action Bar — Intuitive Controls on Top */}
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Search + Quick Intuitive Filters (Date, Outcome, Zone, Market) */}
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 auto' }}>
            {/* Search Input with inline clear */}
            <div style={{ position: 'relative', minWidth: '170px', maxWidth: '260px', flex: '1 1 180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search shop, notes, rep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.42rem 1.8rem 0.42rem 2rem',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Visit Outcome: Ordered & Pitched Quick Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-input, #f1f5f9)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px'
              }}
              title="Filter by Visit Outcome: Ordered / Pitched"
            >
              {[
                { id: 'ALL', label: 'All Outcomes' },
                { id: 'ORDERED', label: 'Ordered' },
                { id: 'PITCHED', label: 'Pitched' }
              ].map((opt) => {
                const active = activityFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActivityFilter(opt.id)}
                    style={{
                      padding: '0.26rem 0.6rem',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Date Presets Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-input, #f1f5f9)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px'
              }}
              title="Quick Date Timeframe"
            >
              {[
                { id: 'ALL', label: 'All' },
                { id: 'TODAY', label: 'Today' },
                { id: '7DAYS', label: '7D' },
                { id: '30DAYS', label: '30D' },
                { id: 'THIS_MONTH', label: 'Month' }
              ].map((p) => {
                const active = datePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setDatePreset(p.id);
                      if (p.id !== 'CUSTOM') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }
                    }}
                    style={{
                      padding: '0.26rem 0.55rem',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: 'none',
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Territory Zone Quick Selector */}
            <div style={{ width: '135px', minWidth: '115px' }}>
              <CustomSelect
                value={zoneFilter}
                onChange={(val) => {
                  setZoneFilter(val);
                  setMarketFilter('ALL');
                }}
                placeholder="All Zones"
                size="sm"
                options={[
                  { value: 'ALL', label: 'All Zones' },
                  ...zones.map((z) => ({ value: z.id, label: z.name }))
                ]}
                searchable={zones.length > 5}
                searchPlaceholder="Search zone..."
              />
            </div>

            {/* Market Quick Selector */}
            <div style={{ width: '145px', minWidth: '125px' }}>
              <CustomSelect
                value={marketFilter}
                onChange={(val) => setMarketFilter(val)}
                placeholder="All Markets"
                size="sm"
                options={[
                  { value: 'ALL', label: 'All Markets' },
                  ...filteredMarkets.map((m) => ({ value: m.id, label: m.name }))
                ]}
                searchable={filteredMarkets.length > 5}
                searchPlaceholder="Search market..."
              />
            </div>
          </div>

          {/* Right: Filter Panel Toggle & Reset */}
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                padding: '0.42rem 0.75rem',
                borderRadius: '6px',
                borderColor: isFilterPanelOpen || activeFilterCount > 0 ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: isFilterPanelOpen || activeFilterCount > 0 ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                color: isFilterPanelOpen || activeFilterCount > 0 ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: activeFilterCount > 0 ? 600 : 500
              }}
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '999px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    width: '17px',
                    height: '17px',
                    marginLeft: '2px'
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {(activeFilterCount > 0 || selectedVendorId) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedVendorId('');
                  setSearchParams({});
                  setZoneFilter('ALL');
                  setMarketFilter('ALL');
                  setRepFilter('ALL');
                  setBookFilter('ALL');
                  setStatusFilter('ALL');
                  setActivityFilter('ALL');
                  setDatePreset('ALL');
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setSearchTerm('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.78rem',
                  padding: '0.42rem 0.65rem',
                  borderRadius: '6px',
                  color: 'var(--text-muted)'
                }}
                title="Reset all active filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* EXPANDABLE SOPHISTICATED FILTER PANEL DECK */}
        {isFilterPanelOpen && (
          <div
            style={{
              marginTop: '0.35rem',
              padding: '1rem',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'ckrSelectFadeIn 0.18s ease-out'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Advanced Ledger Filters
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  Filter field visits across territory, markets, rep, catalog books, and conversion outcomes
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Dimensional Dropdowns Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {/* Territory Zone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Territory Zone
                </label>
                <CustomSelect
                  value={zoneFilter}
                  onChange={(val) => {
                    setZoneFilter(val);
                    setMarketFilter('ALL');
                  }}
                  placeholder="All Territories"
                  size="sm"
                  options={[
                    { value: 'ALL', label: 'All Territories' },
                    ...zones.map((z) => ({ value: z.id, label: z.name }))
                  ]}
                  searchable={zones.length > 5}
                  searchPlaceholder="Filter zones..."
                />
              </div>

              {/* Market / Bazaar */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Market / Bazaar
                </label>
                <CustomSelect
                  value={marketFilter}
                  onChange={(val) => setMarketFilter(val)}
                  placeholder="All Markets"
                  size="sm"
                  options={[
                    { value: 'ALL', label: 'All Markets' },
                    ...filteredMarkets.map((m) => ({ value: m.id, label: m.name }))
                  ]}
                  searchable={filteredMarkets.length > 5}
                  searchPlaceholder="Filter markets..."
                />
              </div>

              {/* Sales Rep */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Sales Representative
                </label>
                <CustomSelect
                  value={repFilter}
                  onChange={(val) => setRepFilter(val)}
                  placeholder="All Sales Reps"
                  size="sm"
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

              {/* Catalog Book */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Pitched / Bought Book
                </label>
                <CustomSelect
                  value={bookFilter}
                  onChange={(val) => setBookFilter(val)}
                  placeholder="All Wallpaper Books"
                  size="sm"
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
            </div>

            {/* Quick Segmented Pill Rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              {/* Timeframe Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Timeframe
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {[
                    { id: 'ALL', label: 'All Time' },
                    { id: 'TODAY', label: 'Today' },
                    { id: '7DAYS', label: 'Last 7 Days' },
                    { id: '30DAYS', label: 'Last 30 Days' },
                    { id: 'THIS_MONTH', label: 'This Month' },
                    { id: 'CUSTOM', label: 'Custom Range' }
                  ].map((p) => {
                    const active = datePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setDatePreset(p.id);
                          if (p.id !== 'CUSTOM') {
                            setCustomStartDate('');
                            setCustomEndDate('');
                          }
                        }}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: active ? 'var(--primary)' : 'var(--bg-card, #ffffff)',
                          color: active ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: active ? 600 : 400,
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Inline Date Pickers for Custom Date Range */}
                {(datePreset === 'CUSTOM' || customStartDate || customEndDate) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From:</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => {
                          setCustomStartDate(e.target.value);
                          setDatePreset('CUSTOM');
                        }}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>To:</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => {
                          setCustomEndDate(e.target.value);
                          setDatePreset('CUSTOM');
                        }}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}
                      />
                    </div>
                    {(customStartDate || customEndDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomStartDate('');
                          setCustomEndDate('');
                          setDatePreset('ALL');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Visit Outcome & Activity Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Visit Outcome & Book Activity
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {[
                    { id: 'ALL', label: 'All Outcomes' },
                    { id: 'ORDERED', label: 'Ordered / Bought 📦' },
                    { id: 'PITCHED', label: 'Pitched / Shown 📖' },
                    { id: 'BOTH', label: 'Both Pitched & Ordered ★' },
                    { id: 'NONE', label: 'No Books (General Visit) —' }
                  ].map((opt) => {
                    const active = activityFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActivityFilter(opt.id)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: active ? 'var(--primary)' : 'var(--bg-card, #ffffff)',
                          color: active ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: active ? 600 : 400,
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Shop Visit Status
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {[
                    { id: 'ALL', label: 'All Visits' },
                    { id: 'AVAILABLE', label: 'Available Only' },
                    { id: 'CLOSED', label: 'Closed Only' }
                  ].map((s) => {
                    const active = statusFilter === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStatusFilter(s.id)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: active ? 'var(--primary)' : 'var(--bg-card, #ffffff)',
                          color: active ? '#ffffff' : 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: active ? 600 : 400,
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Deck Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                onClick={() => {
                  setZoneFilter('ALL');
                  setMarketFilter('ALL');
                  setRepFilter('ALL');
                  setBookFilter('ALL');
                  setStatusFilter('ALL');
                  setActivityFilter('ALL');
                  setDatePreset('ALL');
                  setCustomStartDate('');
                  setCustomEndDate('');
                  const nextP = new URLSearchParams();
                  if (selectedVendorId) nextP.set('vendorId', selectedVendorId);
                  setSearchParams(nextP);
                }}
              >
                Reset Filters
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                onClick={() => {
                  setIsFilterPanelOpen(false);
                  const nextP = new URLSearchParams();
                  if (selectedVendorId) nextP.set('vendorId', selectedVendorId);
                  if (zoneFilter !== 'ALL') nextP.set('zoneId', zoneFilter);
                  if (marketFilter !== 'ALL') nextP.set('marketId', marketFilter);
                  if (repFilter !== 'ALL') nextP.set('repId', repFilter);
                  if (activityFilter !== 'ALL') nextP.set('activity', activityFilter);
                  if (datePreset !== 'ALL') nextP.set('datePreset', datePreset);
                  if (customStartDate) nextP.set('startDate', customStartDate);
                  if (customEndDate) nextP.set('endDate', customEndDate);
                  setSearchParams(nextP);
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE FILTER CHIPS STRIP — ALWAYS RENDERED BELOW THE FILTER PANEL DECK */}
        {(activeFilterCount > 0 || selectedVendorId) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.2rem' }}>
              Active Filters:
            </span>

            {selectedVendorId && (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Store: {vendors.find((v) => v.id === selectedVendorId)?.shop_name || 'Selected Shop'}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleSelectShop('')} />
              </span>
            )}

            {zoneFilter !== 'ALL' && (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Zone: {zones.find((z) => z.id === zoneFilter)?.name || zoneFilter}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setZoneFilter('ALL')} />
              </span>
            )}

            {marketFilter !== 'ALL' && (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Market: {markets.find((m) => m.id === marketFilter)?.name || marketFilter}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMarketFilter('ALL')} />
              </span>
            )}

            {activityFilter !== 'ALL' && (
              <span className="book-badge-chip bought" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Outcome: {activityFilter === 'ORDERED' ? 'Ordered / Bought' : activityFilter === 'PITCHED' ? 'Pitched / Shown' : activityFilter === 'BOTH' ? 'Pitched & Ordered' : 'No Books'}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setActivityFilter('ALL')} />
              </span>
            )}

            {repFilter !== 'ALL' && (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Rep: {salesBoys.find((sb) => sb.id === repFilter)?.name || repFilter}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setRepFilter('ALL')} />
              </span>
            )}

            {bookFilter !== 'ALL' && (
              <span className="book-badge-chip bought" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Book: {books.find((b) => b.id === bookFilter)?.name || bookFilter}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setBookFilter('ALL')} />
              </span>
            )}

            {statusFilter !== 'ALL' && (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Status: {statusFilter === 'AVAILABLE' ? 'Available Only' : 'Closed Only'}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('ALL')} />
              </span>
            )}

            {(customStartDate || customEndDate) ? (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                📅 Range: {customStartDate || '...'} → {customEndDate || '...'}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setDatePreset('ALL');
                    const nextP = new URLSearchParams(searchParams);
                    nextP.delete('startDate');
                    nextP.delete('endDate');
                    nextP.delete('datePreset');
                    setSearchParams(nextP);
                  }}
                />
              </span>
            ) : datePreset !== 'ALL' ? (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                📅 Time: {datePreset === 'TODAY' ? 'Today' : datePreset === '7DAYS' ? 'Last 7 Days' : datePreset === '30DAYS' ? 'Last 30 Days' : 'This Month'}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setDatePreset('ALL');
                    const nextP = new URLSearchParams(searchParams);
                    nextP.delete('datePreset');
                    setSearchParams(nextP);
                  }}
                />
              </span>
            ) : null}

            {searchTerm.trim() && (
              <span className="book-badge-chip shown" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '2px 8px' }}>
                Keyword: "{searchTerm}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedVendorId('');
                setSearchParams({});
                setZoneFilter('ALL');
                setMarketFilter('ALL');
                setRepFilter('ALL');
                setBookFilter('ALL');
                setStatusFilter('ALL');
                setActivityFilter('ALL');
                setDatePreset('ALL');
                setCustomStartDate('');
                setCustomEndDate('');
                setSearchTerm('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: '2px 6px', textDecoration: 'underline' }}
            >
              Clear all
            </button>
          </div>
        )}
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
                  <th>Sample Books Pitched</th>
                  <th>Books Bought</th>
                  <th>Remarks / Notes</th>
                </tr>
              </thead>
              <tbody>
                {processedVisits.length === 0 ? (
                  <tr>
                    <td colSpan={selectedVendorId ? 5 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No field visits match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  processedVisits.map((v) => {
                    const shownBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'shown');
                    const boughtBooks = (v.sales_visit_books || []).filter((b) => b.action_type === 'bought');

                    return (
                      <tr key={v.id} style={{ height: '38px' }}>
                        {/* Visit Date & Time — Strictly One Sleek Line */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(v.visited_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="table-separator">·</span>
                          <span className="table-meta-muted">
                            {new Date(v.visited_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>

                        {/* Retail Shop — Strictly One Sleek Line */}
                        {!selectedVendorId && (
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span
                              style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                              onClick={() => handleSelectShop(v.vendor_id)}
                              title="Click to view shop 360 history"
                            >
                              {v.sales_vendors?.shop_name || 'Retail Shop'}
                            </span>
                            <span className="table-separator">·</span>
                            <span className="table-meta-muted">
                              {v.sales_vendors?.contact_person || 'Owner'}
                              {v.sales_vendors?.sales_zones?.name ? ` (${v.sales_vendors.sales_zones.name})` : ''}
                            </span>
                          </td>
                        )}

                        {/* Sales Rep — Strictly One Sleek Line */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {v.sales_boys?.name || 'Sales Rep'}
                          </span>
                          {v.sales_boys?.phone && (
                            <>
                              <span className="table-separator">·</span>
                              <span className="table-meta-muted">{v.sales_boys.phone}</span>
                            </>
                          )}
                        </td>

                        {/* Sample Books Pitched — Strictly One Sleek Line */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {shownBooks.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              {shownBooks.map((vb) => (
                                <span key={vb.id} className="book-badge-chip shown" style={{ padding: '2px 7px', fontSize: '0.72rem' }}>
                                  {vb.books?.name || 'Catalog'}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Books Bought — Strictly One Sleek Line */}
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {boughtBooks.length === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              {boughtBooks.map((vb) => (
                                <span key={vb.id} className="book-badge-chip bought" style={{ padding: '2px 7px', fontSize: '0.72rem' }}>
                                  {vb.books?.name || 'Book'}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Remarks / Notes — Strictly One Sleek Line */}
                        <td style={{ whiteSpace: 'nowrap', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.comments || ''}>
                          {v.comments ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                              "{v.comments}"
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
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
