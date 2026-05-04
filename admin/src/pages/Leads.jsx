import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Clock, ArrowRight, MessageCircle, Download, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all'
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
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

    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filters.type === 'all' || l.type === filters.type;
        const matchesStatus = filters.status === 'all' || l.status === filters.status;
        return matchesSearch && matchesType && matchesStatus;
    });

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

    return (
        <div className="leads-page">
            <header className="page-header">
                <div>
                    <h1>Inbound Leads</h1>
                    <p>Track and manage customer enquiries and sample requests.</p>
                </div>
            </header>

            <div className="table-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search leads by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <select
                            className="status-select"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                        </select>
                        <button className="btn btn-secondary-glass" onClick={() => { setSearchTerm(''); setFilters({ type: 'all', status: 'all' }); }}>
                            <RotateCcw size={16} />
                        </button>
                        <button className="btn btn-primary" onClick={exportToCSV}>
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Date</th>
                            <th>Contact</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Message / Requirements</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6"><Loader message="Loading leads..." /></td></tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr><td colSpan="6" className="empty">No leads found.</td></tr>
                        ) : (
                            filteredLeads.map((lead, index) => (
                                <tr key={lead.id}>
                                    <td><span className="sno">#{index + 1}</span></td>
                                    <td>
                                        <div className="date-cell">
                                            <Calendar size={12} />
                                            <span>{new Date(lead.created_at).toLocaleString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true
                                            })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <strong>{lead.name}</strong>
                                            <div className="contact-info">
                                                <Mail size={12} /> <span>{lead.email}</span>
                                            </div>
                                            {lead.phone && (
                                                <div className="contact-info">
                                                    <Phone size={12} /> <span>{lead.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {lead.wallpaper ? (
                                            <div className="product-cell">
                                                <strong style={{ color: 'var(--primary)' }}>{lead.wallpaper.name}</strong>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ID: {lead.wallpaper_id}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>General Inquiry</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${lead.type === 'sample' ? 'blue' : lead.type === 'enquiry' ? 'purple' : 'green'}`} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                                            {lead.type}
                                        </span>
                                    </td>
                                    <td>
                                        <p className="message-preview">{lead.message || 'No message provided'}</p>
                                    </td>
                                    <td>
                                        <select
                                            className={`status-select ${lead.status}`}
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <a
                                                href={`mailto:${lead.email}`}
                                                className="icon-btn mail"
                                                title="Send Email"
                                            >
                                                <Mail size={16} />
                                            </a>
                                            <a
                                                href={`https://wa.me/91${lead.phone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="icon-btn whatsapp"
                                                title="Send WhatsApp"
                                            >
                                                <MessageCircle size={16} />
                                            </a>
                                            <a
                                                href={`tel:${lead.phone}`}
                                                className="icon-btn call"
                                                title="Call Now"
                                            >
                                                <Phone size={16} />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .contact-cell { display: flex; flex-direction: column; gap: 0.25rem; }
                .contact-cell strong { color: var(--text-main); }
                .contact-info { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.75rem; }
                .message-preview { max-width: 300px; color: var(--text-dim); font-size: 0.875rem; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
                .status-select { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.4rem 0.6rem; border-radius: 0.5rem; font-size: 0.75rem; cursor: pointer; outline: none; }
                .status-select.pending { border-color: var(--warning); color: var(--warning); }
                .status-select.contacted { border-color: var(--primary); color: var(--primary); }
                .status-select.resolved { border-color: var(--success); color: var(--success); }
                .date-cell { display: flex; align-items: center; gap: 0.5rem; color: var(--text-dim); font-size: 0.75rem; }
                .loading, .empty { padding: 4rem; text-align: center; color: var(--text-dim); }
                .icon-btn.whatsapp { color: #25D366; border-color: rgba(37, 211, 102, 0.2); }
                .icon-btn.whatsapp:hover { background: rgba(37, 211, 102, 0.1); border-color: #25D366; }
                .icon-btn.call { color: var(--primary); border-color: rgba(59, 130, 246, 0.2); }
                .icon-btn.call:hover { background: rgba(59, 130, 246, 0.1); border-color: var(--primary); }
                .icon-btn.mail { color: var(--warning); border-color: rgba(255, 193, 7, 0.2); }
                .icon-btn.mail:hover { background: rgba(255, 193, 7, 0.1); border-color: var(--warning); }
                .sno { color: var(--text-muted); font-family: monospace; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default Leads;
