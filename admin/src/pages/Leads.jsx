import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Mail, Phone, Calendar, MessageCircle, Download, RotateCcw, Filter } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const Leads = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial URL params
    const initialPreset = searchParams.get('datePreset') || (searchParams.get('startDate') ? 'CUSTOM' : 'ALL');
    const initialStart = searchParams.get('startDate') || '';
    const initialEnd = searchParams.get('endDate') || '';

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || 'all',
        status: searchParams.get('status') || 'all'
    });

    const [datePreset, setDatePreset] = useState(initialPreset);
    const [customStartDate, setCustomStartDate] = useState(initialStart);
    const [customEndDate, setCustomEndDate] = useState(initialEnd);

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

    // Keep URL in sync when date filters change
    useEffect(() => {
        const sp = new URLSearchParams();
        if (datePreset !== 'ALL') sp.set('datePreset', datePreset);
        if (datePreset === 'CUSTOM') {
            if (customStartDate) sp.set('startDate', customStartDate);
            if (customEndDate) sp.set('endDate', customEndDate);
        } else if (datePreset !== 'ALL') {
            const r = getPresetRange(datePreset);
            if (r.startDate) sp.set('startDate', r.startDate);
            if (r.endDate) sp.set('endDate', r.endDate);
        }
        if (filters.type !== 'all') sp.set('type', filters.type);
        if (filters.status !== 'all') sp.set('status', filters.status);
        setSearchParams(sp, { replace: true });
    }, [datePreset, customStartDate, customEndDate, filters.type, filters.status]);

    // Active range description text
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

    useEffect(() => {
        fetchLeads();
    }, [datePreset, customStartDate, customEndDate]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const params = {};
            if (datePreset !== 'ALL') params.datePreset = datePreset;
            if (datePreset === 'CUSTOM') {
                if (customStartDate) params.startDate = customStartDate;
                if (customEndDate) params.endDate = customEndDate;
            } else if (datePreset !== 'ALL') {
                const r = getPresetRange(datePreset);
                if (r.startDate) params.startDate = r.startDate;
                if (r.endDate) params.endDate = r.endDate;
            }
            const res = await api.get('/leads', { params });
            setLeads(res.data || []);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/leads/${id}/status`, { status: newStatus });
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    // Client-side filtering
    const filteredLeads = useMemo(() => {
        let activeStart = customStartDate;
        let activeEnd = customEndDate;
        if (datePreset !== 'ALL' && datePreset !== 'CUSTOM') {
            const r = getPresetRange(datePreset);
            activeStart = r.startDate;
            activeEnd = r.endDate;
        }

        return leads.filter(l => {
            const matchesSearch = !searchTerm.trim() ||
                l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.phone?.includes(searchTerm);
            const matchesType = filters.type === 'all' || l.type === filters.type;
            const matchesStatus = filters.status === 'all' || l.status === filters.status;

            let matchesDate = true;
            if (activeStart || activeEnd) {
                const leadDateStr = l.created_at ? l.created_at.slice(0, 10) : '';
                if (activeStart && leadDateStr < activeStart) matchesDate = false;
                if (activeEnd && leadDateStr > activeEnd) matchesDate = false;
            }

            return matchesSearch && matchesType && matchesStatus && matchesDate;
        });
    }, [leads, searchTerm, filters, datePreset, customStartDate, customEndDate]);

    const handleResetAllFilters = () => {
        setSearchTerm('');
        setFilters({ type: 'all', status: 'all' });
        setDatePreset('ALL');
        setCustomStartDate('');
        setCustomEndDate('');
    };

    const exportToCSV = () => {
        const headers = ["S.No", "Date", "Name", "Email", "Phone", "Product", "Type", "Status", "Message"];
        const rows = filteredLeads.map((l, index) => [
            index + 1,
            new Date(l.created_at).toLocaleDateString(),
            l.name,
            l.email,
            l.phone,
            l.wallpaper?.name || "General Inquiry",
            l.type,
            l.status,
            l.message?.replace(/,/g, " ") || ""
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Leads_Export_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const isFiltered = datePreset !== 'ALL' || customStartDate || customEndDate || filters.type !== 'all' || filters.status !== 'all' || searchTerm;

    return (
        <div className="leads-page" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <header className="page-header" style={{ padding: '0.2rem 0', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Inbound Leads</h1>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Track and manage customer enquiries and sample requests.
                        </p>
                    </div>

                    {/* Quick Date Presets Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                                            padding: '0.22rem 0.5rem',
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

                        {/* Inline Custom Date Inputs */}
                        {(datePreset === 'CUSTOM' || customStartDate || customEndDate) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => {
                                        setCustomStartDate(e.target.value);
                                        setDatePreset('CUSTOM');
                                    }}
                                    style={{
                                        padding: '0.22rem 0.4rem',
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
                                        padding: '0.22rem 0.4rem',
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

                        <button
                            className="btn btn-primary"
                            onClick={exportToCSV}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
                        >
                            <Download size={13} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Filter Toolbar & Active Pills */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                    background: 'var(--bg-card)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
                    <div className="search-box" style={{ flex: 1, minWidth: '200px', margin: 0, padding: '0.25rem 0.6rem' }}>
                        <Search size={14} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ fontSize: '0.78rem', background: 'transparent' }}
                        />
                    </div>

                    <select
                        className="status-select"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                    >
                        <option value="all">All Types</option>
                        <option value="enquiry">Enquiry</option>
                        <option value="sample">Sample</option>
                        <option value="appointment">Appointment</option>
                    </select>

                    <select
                        className="status-select"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        style={{ height: '30px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isFiltered && (
                        <button
                            className="btn btn-secondary"
                            onClick={handleResetAllFilters}
                            title="Reset all filters"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.28rem 0.5rem' }}
                        >
                            <RotateCcw size={11} />
                            <span>Reset Filters</span>
                        </button>
                    )}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {filteredLeads.length} leads
                    </span>
                </div>
            </div>

            {/* Active Date / Status Filter Badges Row */}
            {activeRangeText && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                        style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            backgroundColor: 'rgba(29, 78, 216, 0.08)',
                            border: '1px solid rgba(29, 78, 216, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Calendar size={12} />
                        Filtered Period: {activeRangeText}
                    </span>
                    <button
                        onClick={() => { setDatePreset('ALL'); setCustomStartDate(''); setCustomEndDate(''); }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            textDecoration: 'underline'
                        }}
                    >
                        Clear Date
                    </button>
                </div>
            )}

            {/* Strictly CKR Tabular Data Table (One Sleek Line Per Row: 36px–38px) */}
            <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                            <th style={{ width: '150px' }}>DATE</th>
                            <th style={{ minWidth: '220px' }}>CONTACT</th>
                            <th style={{ minWidth: '130px' }}>PRODUCT</th>
                            <th style={{ width: '90px' }}>TYPE</th>
                            <th style={{ minWidth: '240px' }}>MESSAGE / REQUIREMENTS</th>
                            <th style={{ width: '110px' }}>STATUS</th>
                            <th style={{ width: '95px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Loader message="Loading inbound leads..." />
                                </td>
                            </tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                                    No leads found matching your active filters.
                                </td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead, index) => (
                                <tr key={lead.id}>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="sno" style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem' }}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-cell-inline" style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            <Calendar size={12} color="var(--text-muted)" />
                                            <span>
                                                {new Date(lead.created_at).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-cell-inline" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{lead.name}</strong>
                                            <span className="table-meta-muted">&lt;{lead.email}&gt;</span>
                                            {lead.phone && <span className="table-meta-muted">• {lead.phone}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-cell-inline" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {lead.wallpaper?.name ? (
                                                <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.78rem' }}>
                                                    {lead.wallpaper.name}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                                                    General Inquiry
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                fontSize: '0.68rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                backgroundColor: lead.type === 'sample' ? 'rgba(59, 130, 246, 0.1)' : lead.type === 'appointment' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                color: lead.type === 'sample' ? '#3B82F6' : lead.type === 'appointment' ? '#10B981' : '#8B5CF6',
                                                border: `1px solid ${lead.type === 'sample' ? 'rgba(59, 130, 246, 0.25)' : lead.type === 'appointment' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(139, 92, 246, 0.25)'}`
                                            }}
                                        >
                                            {lead.type || 'enquiry'}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                maxWidth: '280px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-block',
                                                color: 'var(--text-dim)',
                                                fontSize: '0.78rem',
                                                verticalAlign: 'middle'
                                            }}
                                            title={lead.message || 'No remarks'}
                                        >
                                            {lead.message || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className={`status-select ${lead.status}`}
                                            value={lead.status || 'new'}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                            style={{
                                                height: '26px',
                                                padding: '2px 6px',
                                                fontSize: '0.72rem',
                                                borderRadius: '4px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <a
                                                href={`mailto:${lead.email}`}
                                                className="icon-btn mail"
                                                title={`Email ${lead.name}`}
                                                style={{ width: '24px', height: '24px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                                            >
                                                <Mail size={13} />
                                            </a>
                                            {lead.phone ? (
                                                <>
                                                    <a
                                                        href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="icon-btn whatsapp"
                                                        title="WhatsApp"
                                                        style={{ width: '24px', height: '24px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                                                    >
                                                        <MessageCircle size={13} />
                                                    </a>
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        className="icon-btn call"
                                                        title="Call"
                                                        style={{ width: '24px', height: '24px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                                                    >
                                                        <Phone size={13} />
                                                    </a>
                                                </>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .status-select { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 4px; outline: none; }
                .status-select.new { color: var(--primary); border-color: rgba(29, 78, 216, 0.4); }
                .status-select.contacted { color: #f59e0b; border-color: rgba(245, 158, 11, 0.4); }
                .status-select.closed { color: #10b981; border-color: rgba(16, 185, 129, 0.4); }
                .icon-btn { border: 1px solid var(--border-color); background: var(--bg-card); transition: all 0.15s ease; }
                .icon-btn.whatsapp { color: #25D366; border-color: rgba(37, 211, 102, 0.3); }
                .icon-btn.whatsapp:hover { background: rgba(37, 211, 102, 0.12); }
                .icon-btn.call { color: var(--primary); border-color: rgba(29, 78, 216, 0.3); }
                .icon-btn.call:hover { background: rgba(29, 78, 216, 0.12); }
                .icon-btn.mail { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
                .icon-btn.mail:hover { background: rgba(245, 158, 11, 0.12); }
                .sno { color: var(--text-muted); font-family: monospace; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default Leads;
