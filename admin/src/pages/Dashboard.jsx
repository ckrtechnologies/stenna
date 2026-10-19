import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Image as ImageIcon,
  Layers,
  TrendingUp,
  RefreshCw,
  UserCheck,
  Book,
  Store,
  MapPin,
  Building2,
  CalendarCheck,
  Clock,
  ArrowRight,
  PieChart,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import {
  useGetDashboardStatsQuery,
  useGetSalesAnalyticsQuery,
  useGetMarketsQuery
} from '../store/slices/dashboardApi';
import Loader from '../components/Loader';

const CompactStatCard = ({ title, value, icon, color, path, subtext, badge }) => (
  <Link
    to={path}
    className="compact-stat-card"
    style={{
      textDecoration: 'none',
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.42rem 0.65rem',
      borderRadius: '6px',
      background: 'var(--bg-stat-card, #f8fafc)',
      border: '1px solid var(--bg-stat-card-border, var(--border-color))',
      transition: 'all 0.15s ease',
      minHeight: '52px'
    }}
  >
    <div
      className={`icon-box ${color}`}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '3px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              flexShrink: 0,
              lineHeight: 1.2
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '1px' }}>
        <span
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.1
          }}
        >
          {value}
        </span>
        {subtext && (
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  </Link>
);

const CompactGroupHeader = ({ icon, title, subtitle, actionPath, actionLabel }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', gap: '0.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '5px',
          background: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {React.cloneElement(icon, { size: 13 })}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
        <h2 style={{ fontSize: '0.86rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
          {title}
        </h2>
        {subtitle && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            • {subtitle}
          </span>
        )}
      </div>
    </div>
    {actionPath && (
      <Link
        to={actionPath}
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--primary)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          whiteSpace: 'nowrap'
        }}
      >
        <span>{actionLabel}</span>
        <ArrowRight size={11} />
      </Link>
    )}
  </div>
);

const Dashboard = () => {
  // Date Filter State: ALL, TODAY, 7DAYS, 30DAYS, THIS_MONTH, CUSTOM
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper to resolve preset into concrete YYYY-MM-DD boundaries
  const getPresetRange = (presetId) => {
    const now = new Date();
    const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (presetId === 'TODAY') {
      const todayStr = formatYMD(now);
      return { startDate: todayStr, endDate: todayStr, label: 'Today' };
    }
    if (presetId === '7DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return { startDate: formatYMD(past), endDate: formatYMD(now), label: 'Last 7 Days' };
    }
    if (presetId === '30DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      return { startDate: formatYMD(past), endDate: formatYMD(now), label: 'Last 30 Days' };
    }
    if (presetId === 'THIS_MONTH') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: formatYMD(first), endDate: formatYMD(now), label: 'This Month' };
    }
    return { startDate: '', endDate: '', label: 'All Time' };
  };

  // Compute query parameters for API calls
  const queryParams = useMemo(() => {
    const p = {};
    if (datePreset !== 'ALL') p.datePreset = datePreset;
    if (datePreset === 'CUSTOM') {
      if (customStartDate) p.startDate = customStartDate;
      if (customEndDate) p.endDate = customEndDate;
    } else if (datePreset !== 'ALL') {
      const range = getPresetRange(datePreset);
      if (range.startDate) p.startDate = range.startDate;
      if (range.endDate) p.endDate = range.endDate;
    }
    return p;
  }, [datePreset, customStartDate, customEndDate]);

  // Compute query string to pass to internal page links
  const dateSearchQuery = useMemo(() => {
    const sp = new URLSearchParams();
    if (datePreset && datePreset !== 'ALL') sp.set('datePreset', datePreset);
    if (datePreset === 'CUSTOM') {
      if (customStartDate) sp.set('startDate', customStartDate);
      if (customEndDate) sp.set('endDate', customEndDate);
    } else if (datePreset !== 'ALL') {
      const range = getPresetRange(datePreset);
      if (range.startDate) sp.set('startDate', range.startDate);
      if (range.endDate) sp.set('endDate', range.endDate);
    }
    const s = sp.toString();
    return s ? `?${s}` : '';
  }, [datePreset, customStartDate, customEndDate]);

  const activeRangeText = useMemo(() => {
    if (datePreset === 'ALL') return null;
    if (datePreset === 'CUSTOM') {
      if (customStartDate && customEndDate) return `${customStartDate} → ${customEndDate}`;
      if (customStartDate) return `From ${customStartDate}`;
      if (customEndDate) return `Until ${customEndDate}`;
      return 'Custom Range';
    }
    const r = getPresetRange(datePreset);
    return `${r.label} (${r.startDate} to ${r.endDate})`;
  }, [datePreset, customStartDate, customEndDate]);

  const {
    data: catalogStats = {},
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
    refetch: refetchCatalog
  } = useGetDashboardStatsQuery(queryParams);

  const {
    data: salesAnalytics = {},
    isLoading: isSalesLoading,
    isFetching: isSalesFetching,
    refetch: refetchSales
  } = useGetSalesAnalyticsQuery(queryParams);

  const {
    data: marketsList = [],
    isLoading: isMarketsLoading,
    refetch: refetchMarkets
  } = useGetMarketsQuery();

  const isRefreshing = isCatalogFetching || isSalesFetching;
  const isInitialLoading = isCatalogLoading && isSalesLoading;

  const handleRefreshAll = () => {
    refetchCatalog();
    refetchSales();
    refetchMarkets();
  };

  const handleResetDate = () => {
    setDatePreset('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const salesSummary = salesAnalytics?.summary || {};

  if (isInitialLoading) {
    return <Loader />;
  }

  const isDateFiltered = datePreset !== 'ALL' || customStartDate || customEndDate;

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {/* Top Header Bar — High Density with Date Range Filters */}
      <header
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.2rem 0',
          marginBottom: 0
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Master Dashboard</h1>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Live operations pulse across field tracking, dealers, and catalogue
            </span>
          </div>
          {activeRangeText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  backgroundColor: 'rgba(29, 78, 216, 0.08)',
                  border: '1px solid rgba(29, 78, 216, 0.2)',
                  borderRadius: '4px',
                  padding: '1px 7px'
                }}
              >
                📅 Active Filter: {activeRangeText}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls & Date Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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
              { id: 'THIS_MONTH', label: 'Month' },
              { id: 'CUSTOM', label: 'Custom' }
            ].map((preset) => {
              const active = datePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setDatePreset(preset.id);
                    if (preset.id !== 'CUSTOM') {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
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
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Inline Custom Date Inputs (when CUSTOM is active) */}
          {(datePreset === 'CUSTOM' || customStartDate || customEndDate) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setDatePreset('CUSTOM');
                }}
                style={{
                  padding: '0.25rem 0.45rem',
                  fontSize: '0.72rem',
                  borderRadius: '5px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)'
                }}
                title="Start Date"
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setDatePreset('CUSTOM');
                }}
                style={{
                  padding: '0.25rem 0.45rem',
                  fontSize: '0.72rem',
                  borderRadius: '5px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)'
                }}
                title="End Date"
              />
            </div>
          )}

          {/* Reset Date Filter Button */}
          {isDateFiltered && (
            <button
              className="btn btn-secondary"
              onClick={handleResetDate}
              title="Reset date filter to All Time"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                padding: '0.3rem 0.5rem',
                color: 'var(--text-muted)'
              }}
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            className="btn btn-primary"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Pulse'}</span>
          </button>
        </div>
      </header>

      {/* ROW 1: FIELD SALES & TERRITORY BEAT OPERATIONS (Brought to the TOP) */}
      <section className="dashboard-row-group" style={{ padding: '0.65rem 0.8rem', borderRadius: '8px' }}>
        <CompactGroupHeader
          icon={<TrendingUp />}
          title="Field Sales & Territory Operations"
          subtitle="Real-time field visit tracking, territory coverage, and rep beats"
          actionPath={`/sales-tracking/shop-history${dateSearchQuery}`}
          actionLabel="Visit Ledger"
        />
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.5rem'
          }}
        >
          <CompactStatCard
            title="Total Field Visits"
            value={salesSummary.totalVisits || 0}
            icon={<CalendarCheck />}
            color="green"
            path={`/sales-tracking/shop-history${dateSearchQuery}`}
            subtext={isDateFiltered ? 'filtered visits' : 'verified logs'}
          />
          <CompactStatCard
            title="Stores Reached"
            value={salesSummary.uniqueShopsVisited || 0}
            icon={<Store />}
            color="blue"
            path="/sales-tracking/vendors?visitStatus=VISITED"
            subtext={`of ${salesSummary.totalShops || 0} stores`}
          />
          <CompactStatCard
            title="Beat Coverage"
            value={`${salesSummary.coveragePercent || 0}%`}
            icon={<PieChart />}
            color="purple"
            path={`/sales-tracking/dashboard${dateSearchQuery}`}
            badge={`${salesSummary.coveragePercent || 0}%`}
          />
          <CompactStatCard
            title="Active Field Reps"
            value={salesSummary.totalSalesReps || 0}
            icon={<UserCheck />}
            color="indigo"
            path="/sales-tracking/sales-boys"
            subtext="deployed reps"
          />
          <CompactStatCard
            title="Territory Zones"
            value={salesSummary.totalZones || 0}
            icon={<MapPin />}
            color="pink"
            path="/sales-tracking/zones"
            subtext="hub regions"
          />
          <CompactStatCard
            title="Hub Markets"
            value={marketsList.length || 0}
            icon={<Building2 />}
            color="orange"
            path="/sales-tracking/markets"
            subtext="bazaars"
          />
        </div>
      </section>

      {/* ROW 2: DEALER NETWORK & INBOUND PIPELINE */}
      <section className="dashboard-row-group" style={{ padding: '0.65rem 0.8rem', borderRadius: '8px' }}>
        <CompactGroupHeader
          icon={<Users />}
          title="Dealer Network & Inbound Pipeline"
          subtitle="Showroom dealer network, architects, and customer inquiries"
          actionPath="/dealers"
          actionLabel="Manage Dealers"
        />
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem'
          }}
        >
          <CompactStatCard
            title="Registered Dealers"
            value={catalogStats.dealers || 0}
            icon={<UserCheck />}
            color="indigo"
            path="/dealers"
            subtext="verified showroom accounts"
          />
          <CompactStatCard
            title="Inbound Leads"
            value={catalogStats.leads || 0}
            icon={<Users />}
            color="green"
            path={`/leads${dateSearchQuery}`}
            subtext="customer quote requests"
          />
          <CompactStatCard
            title="Stores Pending Visit"
            value={salesSummary.unvisitedShopsCount || 0}
            icon={<Clock />}
            color="orange"
            path="/sales-tracking/vendors?visitStatus=UNVISITED"
            badge={salesSummary.unvisitedShopsCount > 0 ? `${salesSummary.unvisitedShopsCount} Pending` : 'All Visited'}
            subtext="action required"
          />
        </div>
      </section>

      {/* ROW 3: CATALOGUE & SAMPLE BOOKS (Top Trending card REMOVED per requirement 3) */}
      <section className="dashboard-row-group" style={{ padding: '0.65rem 0.8rem', borderRadius: '8px' }}>
        <CompactGroupHeader
          icon={<ImageIcon />}
          title="Catalogue & Creative Library"
          subtitle="Curated design wallpaper collections, categories, and physical books"
          actionPath="/wallpapers"
          actionLabel="View Catalogue"
        />
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem'
          }}
        >
          <CompactStatCard
            title="Total Wallpapers"
            value={catalogStats.wallpapers || 0}
            icon={<ImageIcon />}
            color="blue"
            path="/wallpapers"
            subtext="curated digital designs"
          />
          <CompactStatCard
            title="Design Categories"
            value={catalogStats.categories || 0}
            icon={<Layers />}
            color="purple"
            path="/categories"
            subtext="themes & collections"
          />
          <CompactStatCard
            title="Sample Books"
            value={catalogStats.books || 0}
            icon={<Book />}
            color="pink"
            path="/books"
            subtext="physical catalog editions"
          />
        </div>
      </section>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dashboard-row-group {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .compact-stat-card {
          background: var(--bg-stat-card, #f8fafc);
          border: 1px solid var(--bg-stat-card-border, var(--border-color));
        }
        .compact-stat-card:hover {
          border-color: var(--primary) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        [data-theme='dark'] .dashboard-row-group {
          background: #1e293b !important;
          border-color: rgba(51, 65, 85, 0.6) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }
        [data-theme='dark'] .compact-stat-card {
          background: rgba(15, 23, 42, 0.7) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        [data-theme='dark'] .compact-stat-card:hover {
          background: rgba(30, 41, 59, 0.9) !important;
          border-color: var(--primary) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
