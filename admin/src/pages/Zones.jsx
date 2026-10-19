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
  XCircle
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import '../styles/salesTracking.css';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales-tracking/admin/zones');
      setZones(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load zones', err);
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

  const filteredAndSortedZones = useMemo(() => {
    return zones
      .filter((z) => {
        if (!searchTerm.trim()) return true;
        const s = searchTerm.toLowerCase();
        return z.name?.toLowerCase().includes(s) || z.description?.toLowerCase().includes(s);
      })
      .sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [zones, searchTerm, sortField, sortOrder]);

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormData({ name: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      isActive: zone.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingZone) {
        const res = await api.put(`/sales-tracking/admin/zones/${editingZone.id}`, formData);
        setZones((prev) =>
          prev.map((z) => (z.id === editingZone.id ? { ...z, ...res.data?.data } : z))
        );
      } else {
        const res = await api.post('/sales-tracking/admin/zones', formData);
        setZones((prev) => [...prev, res.data?.data]);
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sales zone?')) return;
    try {
      await api.delete(`/sales-tracking/admin/zones/${id}`);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="sales-tracking-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Zone Master (Sales Territories)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Define regional boundaries and territories for retail shop allocations and sales reps.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Zone</span>
        </button>
      </header>

      {/* Search */}
      <div className="card" style={{ maxWidth: '400px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search zone by name or description..."
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

      {loading ? (
        <Loader />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('name')}>
                    <span>Zone / Territory Name</span> {renderSortIndicator('name')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('description')}>
                    <span>Description / Coverage</span> {renderSortIndicator('description')}
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
              {filteredAndSortedZones.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No zones defined yet. Click "Add New Zone" to create one.
                  </td>
                </tr>
              ) : (
                filteredAndSortedZones.map((zone) => (
                  <tr key={zone.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="var(--primary)" />
                        <strong>{zone.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {zone.description || '—'}
                    </td>
                    <td>
                      <span className={`status-tag ${zone.is_active ? 'active' : 'inactive'}`}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(zone.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="icon-btn"
                          title="Edit Zone"
                          onClick={() => handleOpenEdit(zone)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="icon-btn red"
                          title="Delete Zone"
                          onClick={() => handleDelete(zone.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingZone ? 'Edit Zone' : 'Add New Territory Zone'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zone 1 - South Delhi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description / Sub-areas
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Lajpat Nagar, Greater Kailash, Saket, Hauz Khas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveZone"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActiveZone" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Active Operating Zone
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
