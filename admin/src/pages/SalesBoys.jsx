import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Users,
  Edit,
  Phone,
  Lock,
  MapPin,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  XCircle,
  Trash2
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import '../styles/salesTracking.css';

export default function SalesBoys() {
  const [salesBoys, setSalesBoys] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoy, setEditingBoy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    zoneIds: [],
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sbRes, zRes] = await Promise.all([
        api.get('/sales-tracking/admin/sales-boys'),
        api.get('/sales-tracking/admin/zones')
      ]);
      setSalesBoys(sbRes.data?.data || []);
      setZones(zRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load sales reps or zones', err);
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

  const filteredAndSortedReps = useMemo(() => {
    return salesBoys
      .filter((b) => {
        if (!searchTerm.trim()) return true;
        const s = searchTerm.toLowerCase();
        return b.name?.toLowerCase().includes(s) || b.phone?.includes(s);
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
  }, [salesBoys, searchTerm, sortField, sortOrder]);

  const handleOpenAdd = () => {
    setEditingBoy(null);
    setFormData({
      name: '',
      phone: '',
      password: '',
      zoneIds: [],
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (boy) => {
    setEditingBoy(boy);
    const existingZoneIds = (boy.sales_boy_zones || []).map((sbz) => sbz.zone_id);
    setFormData({
      name: boy.name,
      phone: boy.phone,
      password: '',
      zoneIds: existingZoneIds,
      isActive: boy.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleZoneToggle = (zoneId) => {
    setFormData((prev) => {
      const exists = prev.zoneIds.includes(zoneId);
      return {
        ...prev,
        zoneIds: exists ? prev.zoneIds.filter((id) => id !== zoneId) : [...prev.zoneIds, zoneId]
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBoy) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/sales-tracking/admin/sales-boys/${editingBoy.id}`, payload);
      } else {
        await api.post('/sales-tracking/admin/sales-boys', formData);
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rep) => {
    const confirmMsg = `Are you sure you want to delete sales rep "${rep.name}"? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/sales-tracking/admin/sales-boys/${rep.id}`);
      fetchInitialData();
    } catch (err) {
      console.error('Failed to delete sales rep:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete sales rep');
    }
  };

  const handleToggleStatus = async (rep) => {
    try {
      await api.put(`/sales-tracking/admin/sales-boys/${rep.id}`, {
        isActive: !rep.is_active
      });
      fetchInitialData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  return (
    <div className="sales-tracking-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sales Reps Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage field sales team accounts, app logins, and multi-zone territory assignments.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Sales Rep</span>
        </button>
      </header>

      {/* Search */}
      <div className="card" style={{ maxWidth: '400px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search sales rep by name or phone..."
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
        <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>S.NO</th>
                <th style={{ width: '200px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('name')}>
                    <span>Representative Name</span> {renderSortIndicator('name')}
                  </div>
                </th>
                <th style={{ width: '130px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('phone')}>
                    <span>Phone Number</span> {renderSortIndicator('phone')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('sales_boy_zones')}>
                    <span>Assigned Operating Zones</span> {renderSortIndicator('sales_boy_zones')}
                  </div>
                </th>
                <th style={{ width: '110px', textAlign: 'center' }}>
                  <div className="table-sort-header" style={{ justifyContent: 'center' }} onClick={() => handleSort('is_active')}>
                    <span>Status</span> {renderSortIndicator('is_active')}
                  </div>
                </th>
                <th style={{ width: '130px' }}>
                  <div className="table-sort-header" onClick={() => handleSort('created_at')}>
                    <span>Joined Date</span> {renderSortIndicator('created_at')}
                  </div>
                </th>
                <th style={{ width: '85px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No sales reps registered yet. Click "Add New Sales Rep" to create an account.
                  </td>
                </tr>
              ) : (
                filteredAndSortedReps.map((rep, index) => {
                  const assignedZones = (rep.sales_boy_zones || []).map((sbz) => sbz.sales_zones).filter(Boolean);
                  return (
                    <tr key={rep.id}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          #{index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="table-cell-inline" style={{ maxWidth: '100%' }} title={rep.name}>
                          <Users size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                          <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rep.name}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <a
                          href={`tel:${rep.phone}`}
                          style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontVariantNumeric: 'tabular-nums' }}
                        >
                          <Phone size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          <span>{rep.phone}</span>
                        </a>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {assignedZones.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No zones assigned</span>
                          ) : (
                            <>
                              {assignedZones.slice(0, 2).map((z) => (
                                <span key={z.id} className="book-badge-chip" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={z.name}>
                                  <MapPin size={10} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.name}</span>
                                </span>
                              ))}
                              {assignedZones.length > 2 && (
                                <span
                                  className="book-badge-chip"
                                  style={{ fontWeight: 700, background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.25)', cursor: 'default' }}
                                  title={assignedZones.map((z) => z.name).join(', ')}
                                >
                                  +{assignedZones.length - 2} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(rep)}
                          className={`status-tag ${rep.is_active ? 'active' : 'inactive'}`}
                          style={{
                            background: rep.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: rep.is_active ? '#10b981' : '#ef4444',
                            border: `1px solid ${rep.is_active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            cursor: 'pointer',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Click to toggle Active / Inactive"
                        >
                          {rep.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {rep.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {rep.created_at ? new Date(rep.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '—'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            className="icon-btn"
                            title="Edit Sales Rep"
                            onClick={() => handleOpenEdit(rep)}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="icon-btn red"
                            title="Delete Sales Rep"
                            onClick={() => handleDelete(rep)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <h3>{editingBoy ? 'Edit Sales Representative' : 'Add New Sales Representative'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Representative Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Phone Number (App Login) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10 Digits Phone (e.g. 9876543210)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {editingBoy ? 'Change Password (Leave blank to keep unchanged)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  required={!editingBoy}
                  placeholder="Minimum 4 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Assign Operating Zones (Multi-Zone Overlap Allowed):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-dark)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  {zones.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No zones available. Create zones first.</span>
                  ) : (
                    zones.map((z) => {
                      const checked = formData.zoneIds.includes(z.id);
                      return (
                        <label key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleZoneToggle(z.id)}
                          />
                          <span>{z.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveRep"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActiveRep" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Active Sales Representative
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
                  {saving ? 'Saving...' : editingBoy ? 'Update Representative' : 'Register Representative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
