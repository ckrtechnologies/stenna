import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileSpreadsheet
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';
import CustomSelect from '../components/CustomSelect';
import '../styles/salesTracking.css';

export default function Vendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');

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
    isActive: true
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Bulk CSV Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedRows, setBulkParsedRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkDefaultZoneId, setBulkDefaultZoneId] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [vRes, zRes] = await Promise.all([
        api.get('/sales-tracking/vendors'),
        api.get('/sales-tracking/admin/zones')
      ]);
      setVendors(vRes.data?.data || []);
      setZones(zRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load vendors or zones', err);
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
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchName = v.shop_name?.toLowerCase().includes(s);
          const matchContact = v.contact_person?.toLowerCase().includes(s);
          const matchPhone = v.phone?.includes(s);
          if (!matchName && !matchContact && !matchPhone) return false;
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
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [vendors, zoneFilter, searchTerm, sortField, sortOrder]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      shopName: '',
      phone: '',
      shopAddress: '',
      contactPerson: '',
      zoneId: zones[0]?.id || '',
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
      'Shop Name,Phone Number,Shop Address,Contact Person,Zone Name\n' +
      'Royal Wall Decor,9876543210,14 Connaught Place Market New Delhi,Rajesh Sharma,Central Delhi\n' +
      'Elegance Wallpapers,9811223344,Plot 45 Sector 18 Noida,Sunil Verma,Noida\n' +
      'Classic Home Interiors,9899001122,Shop 12 MG Road Gurgaon,Anil Mehta,Gurgaon\n';

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
              zoneName
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
        defaultZoneId: bulkDefaultZoneId || null
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
            onChange={(val) => setZoneFilter(val)}
            placeholder="All Territories"
            options={[
              { value: 'ALL', label: 'All Territories' },
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

      {/* Vendors Table */}
      {loading ? (
        <Loader />
      ) : (
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
                    <span>Territory / Zone</span> {renderSortIndicator('sales_zones')}
                  </div>
                </th>
                <th>
                  <div className="table-sort-header" onClick={() => handleSort('is_active')}>
                    <span>Status</span> {renderSortIndicator('is_active')}
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No retail shops found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Store size={16} color="var(--primary)" />
                        <strong>{vendor.shop_name}</strong>
                      </div>
                    </td>
                    <td>{vendor.contact_person}</td>
                    <td>
                      <a
                        href={`tel:${vendor.phone}`}
                        style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Phone size={13} color="var(--text-muted)" />
                        {vendor.phone}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '220px' }}>
                      {vendor.shop_address}
                    </td>
                    <td>
                      <span className="book-badge-chip">
                        {vendor.sales_zones?.name || 'Unassigned'}
                      </span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Assigned Territory / Zone
                  </label>
                  <CustomSelect
                    value={formData.zoneId}
                    onChange={(val) => setFormData({ ...formData, zoneId: val })}
                    placeholder="Unassigned"
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...zones.map((z) => ({ value: z.id, label: z.name }))
                    ]}
                    searchable={zones.length > 5}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="isActiveVendor"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="isActiveVendor" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    Active Vendor
                  </label>
                </div>
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
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                      Default Territory Zone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Used if CSV row doesn't specify a zone)</span>
                    </label>
                    <CustomSelect
                      value={bulkDefaultZoneId}
                      onChange={(val) => setBulkDefaultZoneId(val)}
                      placeholder="-- No Default Zone (Unassigned) --"
                      options={[
                        { value: '', label: '-- No Default Zone (Unassigned) --' },
                        ...zones.map((z) => ({ value: z.id, label: z.name }))
                      ]}
                      searchable={zones.length > 5}
                    />
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
