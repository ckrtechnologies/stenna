import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Building2,
  Store
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

export default function Markets() {
  const [markets, setMarkets] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [formData, setFormData] = useState({
    zoneId: '',
    name: '',
    description: '',
    city: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [mRes, zRes] = await Promise.all([
        api.get('/sales-tracking/admin/markets'),
        api.get('/sales-tracking/admin/zones')
      ]);
      setMarkets(mRes.data?.data || []);
      setZones(zRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load markets or zones', err);
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

  const filteredAndSortedMarkets = useMemo(() => {
    return markets
      .filter((m) => {
        if (zoneFilter !== 'ALL' && m.zone_id !== zoneFilter) return false;
        if (!searchTerm.trim()) return true;
        const s = searchTerm.toLowerCase();
        return (
          m.name?.toLowerCase().includes(s) ||
          m.city?.toLowerCase().includes(s) ||
          m.description?.toLowerCase().includes(s) ||
          m.sales_zones?.name?.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        if (sortField === 'sales_zones') {
          aVal = a.sales_zones?.name || '';
          bVal = b.sales_zones?.name || '';
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [markets, zoneFilter, searchTerm, sortField, sortOrder]);

  const handleOpenAdd = () => {
    setEditingMarket(null);
    setFormData({
      zoneId: zones[0]?.id || '',
      name: '',
      description: '',
      city: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (market) => {
    setEditingMarket(market);
    setFormData({
      zoneId: market.zone_id || '',
      name: market.name,
      description: market.description || '',
      city: market.city || '',
      isActive: market.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Market name is required');
      return;
    }
    if (!formData.zoneId) {
      alert('Please select a Zone for this Market');
      return;
    }

    setSaving(true);
    try {
      if (editingMarket) {
        const res = await api.put(`/sales-tracking/admin/markets/${editingMarket.id}`, formData);
        setMarkets((prev) =>
          prev.map((m) => (m.id === editingMarket.id ? { ...m, ...res.data?.data } : m))
        );
      } else {
        const res = await api.post('/sales-tracking/admin/markets', formData);
        setMarkets((prev) => [...prev, res.data?.data]);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Market? Any shops linked to it may become unassigned.')) return;
    try {
      await api.delete(`/sales-tracking/admin/markets/${id}`);
      setMarkets((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="sales-tracking-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Market Master (Tier 2: Zone &gt; Market &gt; Shop)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Configure commercial clusters and retail hubs inside each sales zone for targeted field visits.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Market</span>
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.75rem 1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search market by name, city, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.5rem',
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ minWidth: '200px' }}>
          <CustomSelect
            value={zoneFilter}
            onChange={(val) => setZoneFilter(val)}
            placeholder="All Zones"
            options={[
              { value: 'ALL', label: 'All Zones / Territories' },
              ...zones.map((z) => ({ value: z.id, label: z.name }))
            ]}
            searchable={zones.length > 5}
            searchPlaceholder="Search zones..."
          />
        </div>

        {(searchTerm || zoneFilter !== 'ALL') && (
          <button
            className="btn"
            style={{ background: 'var(--border-color)', color: 'var(--text-main)' }}
            onClick={() => {
              setSearchTerm('');
              setZoneFilter('ALL');
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
                  <div className="table-sort-header" onClick={() => handleSort('name')}>
                    <span>Market / Bazaar Name</span> {renderSortIndicator('name')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('sales_zones')}>
                    <span>Parent Zone</span> {renderSortIndicator('sales_zones')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('city')}>
                    <span>City / Hub</span> {renderSortIndicator('city')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('description')}>
                    <span>Description / Details</span> {renderSortIndicator('description')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('is_active')}>
                    <span>Status</span> {renderSortIndicator('is_active')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('created_at')}>
                    <span>Created Date</span> {renderSortIndicator('created_at')}
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMarkets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No markets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedMarkets.map((market) => (
                  <tr key={market.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={16} color="var(--primary)" />
                        <strong>{market.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="book-badge-chip">
                        <MapPin size={12} />
                        {market.sales_zones?.name || 'Unassigned Zone'}
                      </span>
                    </td>
                    <td>{market.city || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                      {market.description || '—'}
                    </td>
                    <td>
                      {market.is_active ? (
                        <span className="status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="status-badge inactive" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {market.created_at ? new Date(market.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn-icon"
                          title="Edit Market"
                          onClick={() => handleOpenEdit(market)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete Market"
                          onClick={() => handleDelete(market.id)}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>{editingMarket ? 'Edit Market' : 'Add New Market'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Market / Bazaar Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chawri Bazar, Sadar Market"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Parent Zone / Territory *</label>
                  <CustomSelect
                    value={formData.zoneId}
                    onChange={(val) => setFormData({ ...formData, zoneId: val })}
                    placeholder="Select Zone"
                    options={zones.map((z) => ({ value: z.id, label: z.name }))}
                    searchable={zones.length > 5}
                    searchPlaceholder="Search zones..."
                  />
                </div>

                <div className="form-group">
                  <label>City / Hub Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi, Jaipur, Noida"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description / Details</label>
                  <textarea
                    rows={3}
                    placeholder="Key landmarks, market type, or coverage notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="marketActiveCheckbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="marketActiveCheckbox" style={{ margin: 0, cursor: 'pointer', fontSize: '0.85rem' }}>
                    Active Status (Available for Shop assignment & field tracking)
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: 'var(--border-color)', color: 'var(--text-main)' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingMarket ? 'Update Market' : 'Create Market'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
