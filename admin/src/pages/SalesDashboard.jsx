import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Store,
  CalendarCheck,
  AlertTriangle,
  Users,
  MapPin,
  RefreshCw,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [zones, setZones] = useState([]);
  const [searchParams] = useSearchParams();
  const [selectedZone, setSelectedZone] = useState(searchParams.get('zoneId') || 'ALL');
  const [datePreset, setDatePreset] = useState(searchParams.get('datePreset') || 'ALL');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('shop_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedZone, datePreset, startDate, endDate]);

  const fetchZones = async () => {
    try {
      const res = await api.get('/sales-tracking/admin/zones');
      setZones(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch zones', err);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedZone !== 'ALL') params.set('zoneId', selectedZone);
      if (datePreset !== 'ALL') params.set('datePreset', datePreset);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await api.get(`/sales-tracking/admin/analytics${query}`);
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
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

  const sortedUnvisitedShops = useMemo(() => {
    if (!data?.unvisitedShops) return [];
    return [...data.unvisitedShops].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data?.unvisitedShops, sortField, sortOrder]);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="sort-icon" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="sort-icon active" />
      : <ArrowDown size={12} className="sort-icon active" />;
  };

  return (
    <div className="sales-tracking-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sales Tracking Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Real-time field activity, territory coverage, and sample books conversion metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Date Presets */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '2px'
            }}
          >
            <div style={{ padding: '0 5px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={13} />
            </div>
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
                  onClick={() => setDatePreset(p.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: active ? 700 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '170px' }}>
            <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <CustomSelect
              value={selectedZone}
              onChange={(val) => setSelectedZone(val)}
              placeholder="All Territories"
              options={[
                { value: 'ALL', label: 'All Territories' },
                ...zones.map((z) => ({ value: z.id, label: z.name }))
              ]}
              searchable={zones.length > 5}
              searchPlaceholder="Search zones..."
              size="sm"
            />
          </div>
          <button className="btn btn-primary" onClick={fetchAnalytics}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {loading ? (
        <Loader />
      ) : !data ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No analytics data available.</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="stats-grid">
            {/* Unique Shops (US) Metric */}
            <div className="stat-card">
              <div className="icon-box blue">
                <Store size={22} />
              </div>
              <div className="stat-info">
                <h3>Unique Shops Visited (US)</h3>
                <p>
                  {data.summary.uniqueShopsVisited} / {data.summary.totalShops}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <div className="coverage-bar-track" style={{ height: '6px' }}>
                    <div
                      className="coverage-bar-fill"
                      style={{ width: `${data.summary.coveragePercent}%` }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                    {data.summary.coveragePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Total Field Visits */}
            <div className="stat-card">
              <div className="icon-box green">
                <CalendarCheck size={22} />
              </div>
              <div className="stat-info">
                <h3>Total Visits Logged</h3>
                <p>{data.summary.totalVisits}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Cumulative field interactions
                </span>
              </div>
            </div>

            {/* Coverage Gap: Shops Not Visited */}
            <div className="stat-card">
              <div className="icon-box red">
                <AlertTriangle size={22} />
              </div>
              <div className="stat-info">
                <h3>Shops Not Visited</h3>
                <p>{data.summary.unvisitedShopsCount}</p>
                <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                  Coverage Gap in territory
                </span>
              </div>
            </div>

            {/* Sales Reps */}
            <div className="stat-card">
              <div className="icon-box purple">
                <Users size={22} />
              </div>
              <div className="stat-info">
                <h3>Active Sales Reps</h3>
                <p>{data.summary.totalSalesReps}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Across {data.summary.totalZones} operating zones
                </span>
              </div>
            </div>
          </div>

          {/* Sample Books Conversion Rates */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BookOpen size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Sample Books Pitch vs Purchase Rates</h3>
            </div>
            {data.bookConversions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No sample book interaction logs recorded yet.
              </p>
            ) : (
              <div className="book-conversion-grid">
                {data.bookConversions.map((book) => {
                  const convRate = book.shownCount > 0
                    ? Math.round((book.boughtCount / book.shownCount) * 100)
                    : 0;
                  return (
                    <div key={book.bookId} className="book-conversion-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{book.bookName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Code: {book.bookCode}
                          </div>
                        </div>
                        <span className="book-badge-chip bought">{convRate}% Conv</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>Pitched: <strong>{book.shownCount}</strong></span>
                        <span>Bought: <strong style={{ color: '#10b981' }}>{book.boughtCount}</strong></span>
                      </div>
                      <div className="coverage-bar-track">
                        <div
                          className="coverage-bar-fill"
                          style={{ width: `${Math.min(convRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coverage Gap: Shops Not Visited Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>
                  Coverage Gap — Unvisited Retail Shops ({sortedUnvisitedShops.length})
                </h3>
              </div>
              <button
                className="btn"
                style={{ background: 'var(--border-color)', color: 'var(--text-main)', fontSize: '0.78rem' }}
                onClick={() => navigate('/sales-tracking/vendors?visitStatus=UNVISITED')}
              >
                View Unvisited Shops ({sortedUnvisitedShops.length})
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>
                      <div className="table-sort-header" onClick={() => handleSort('shop_name')}>
                        <span>Shop Name</span> {renderSortIndicator('shop_name')}
                      </div>
                    </th>
                    <th>
                      <div className="table-sort-header" onClick={() => handleSort('contact_person')}>
                        <span>Contact Person</span> {renderSortIndicator('contact_person')}
                      </div>
                    </th>
                    <th>
                      <div className="table-sort-header" onClick={() => handleSort('phone')}>
                        <span>Phone</span> {renderSortIndicator('phone')}
                      </div>
                    </th>
                    <th>
                      <div className="table-sort-header" onClick={() => handleSort('shop_address')}>
                        <span>Address</span> {renderSortIndicator('shop_address')}
                      </div>
                    </th>
                    <th>
                      <div className="table-sort-header" onClick={() => handleSort('sales_zones')}>
                        <span>Zone</span> {renderSortIndicator('sales_zones')}
                      </div>
                    </th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUnvisitedShops.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        All shops in this territory have received field visits! 100% Coverage.
                      </td>
                    </tr>
                  ) : (
                    sortedUnvisitedShops.map((shop) => (
                      <tr key={shop.id}>
                        <td>
                          <strong>{shop.shop_name}</strong>
                        </td>
                        <td>{shop.contact_person}</td>
                        <td>{shop.phone}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                          {shop.shop_address}
                        </td>
                        <td>
                          <span className="book-badge-chip">
                            {shop.sales_zones?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <span className="status-tag unavailable">
                            Unvisited
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="icon-btn"
                            title="View History"
                            onClick={() => navigate(`/sales-tracking/vendors?highlight=${shop.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
