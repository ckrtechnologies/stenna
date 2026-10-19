import { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  MapPin,
  Users,
  Store,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

export default function VisitRecords() {
  const [visits, setVisits] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('visited_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vRes, zRes] = await Promise.all([
        api.get('/sales-tracking/visits?limit=200'),
        api.get('/sales-tracking/admin/zones')
      ]);
      setVisits(vRes.data?.data || []);
      setZones(zRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load visit records', err);
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

  const filteredAndSortedVisits = useMemo(() => {
    return visits
      .filter((v) => {
        if (availabilityFilter === 'AVAILABLE' && !v.is_available) return false;
        if (availabilityFilter === 'UNAVAILABLE' && v.is_available) return false;

        const shopZoneId = v.sales_vendors?.zone_id;
        if (selectedZone !== 'ALL' && shopZoneId !== selectedZone) return false;

        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const shopName = v.sales_vendors?.shop_name?.toLowerCase() || '';
          const repName = v.sales_boys?.name?.toLowerCase() || '';
          const comments = v.comments?.toLowerCase() || '';
          if (!shopName.includes(s) && !repName.includes(s) && !comments.includes(s)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'shop_name') {
          aVal = a.sales_vendors?.shop_name || '';
          bVal = b.sales_vendors?.shop_name || '';
        } else if (sortField === 'rep_name') {
          aVal = a.sales_boys?.name || '';
          bVal = b.sales_boys?.name || '';
        } else if (sortField === 'zone_name') {
          aVal = a.sales_vendors?.sales_zones?.name || '';
          bVal = b.sales_vendors?.sales_zones?.name || '';
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [visits, availabilityFilter, selectedZone, searchTerm, sortField, sortOrder]);

  return (
    <div className="sales-tracking-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Field Visit Records Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Complete chronological audit trail of all field visits logged by sales representatives.
          </p>
        </div>
        <button className="btn btn-primary" onClick={fetchInitialData}>
          <RotateCcw size={16} />
          <span>Refresh Logs</span>
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by shop name, sales rep, or comments..."
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
            value={selectedZone}
            onChange={(val) => setSelectedZone(val)}
            placeholder="All Territories"
            options={[
              { value: 'ALL', label: 'All Territories' },
              ...zones.map((z) => ({ value: z.id, label: z.name }))
            ]}
            searchable={zones.length > 5}
            searchPlaceholder="Search zones..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
          <Filter size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <CustomSelect
            value={availabilityFilter}
            onChange={(val) => setAvailabilityFilter(val)}
            placeholder="All Availabilities"
            options={[
              { value: 'ALL', label: 'All Availabilities' },
              { value: 'AVAILABLE', label: 'Available: Yes' },
              { value: 'UNAVAILABLE', label: 'Not Available: Closed' }
            ]}
            searchable={false}
          />
        </div>

        {(searchTerm || selectedZone !== 'ALL' || availabilityFilter !== 'ALL') && (
          <button
            className="btn"
            style={{ background: 'var(--border-color)', color: 'var(--text-main)' }}
            onClick={() => {
              setSearchTerm('');
              setSelectedZone('ALL');
              setAvailabilityFilter('ALL');
            }}
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('visited_at')}>
                    <span>Visited Date & Time</span> {renderSortIndicator('visited_at')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('shop_name')}>
                    <span>Retail Shop</span> {renderSortIndicator('shop_name')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('zone_name')}>
                    <span>Territory</span> {renderSortIndicator('zone_name')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('rep_name')}>
                    <span>Representative</span> {renderSortIndicator('rep_name')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('is_available')}>
                    <span>Shopkeeper Available</span> {renderSortIndicator('is_available')}
                  </div>
                </th>
                <th>Books Pitched / Shown</th>
                <th>Books Bought / Ordered</th>
                <th>Notes / Feedback</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No field visit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedVisits.map((visit) => {
                  const shownBooks = (visit.sales_visit_books || []).filter((vb) => vb.action_type === 'shown');
                  const boughtBooks = (visit.sales_visit_books || []).filter((vb) => vb.action_type === 'bought');
                  return (
                    <tr key={visit.id}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(visit.visited_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(visit.visited_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Store size={15} color="var(--primary)" />
                          <strong>{visit.sales_vendors?.shop_name || 'Unknown Shop'}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {visit.sales_vendors?.contact_person}
                        </div>
                      </td>
                      <td>
                        <span className="book-badge-chip">
                          {visit.sales_vendors?.sales_zones?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <strong>{visit.sales_boys?.name || 'Rep'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {visit.sales_boys?.phone}
                        </div>
                      </td>
                      <td>
                        <span className={`status-tag ${visit.is_available ? 'available' : 'unavailable'}`}>
                          {visit.is_available ? 'Available: Yes' : 'Not Available'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {shownBooks.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                          ) : (
                            shownBooks.map((vb) => (
                              <span key={vb.id} className="book-badge-chip shown">
                                {vb.books?.code || vb.books?.name || 'Book'}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {boughtBooks.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                          ) : (
                            boughtBooks.map((vb) => (
                              <span key={vb.id} className="book-badge-chip bought">
                                {vb.books?.code || vb.books?.name || 'Book'}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '240px', color: 'var(--text-muted)' }}>
                        {visit.comments ? `"${visit.comments}"` : '—'}
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
  );
}
