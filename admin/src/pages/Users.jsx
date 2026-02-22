import { useState, useEffect } from 'react';
import { Search, User as UserIcon, Shield } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="users-page">
            <header className="page-header">
                <div>
                    <h1>System Users</h1>
                    <p>Manage administrative and customer accounts.</p>
                </div>
            </header>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4"><Loader message="Loading accounts..." /></td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="empty">No users found.</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" />
                                                ) : (
                                                    <UserIcon size={20} />
                                                )}
                                            </div>
                                            <div className="info">
                                                <strong>{user.full_name || 'Anonymous'}</strong>
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`role-badge ${user.role}`}>
                                            <Shield size={14} />
                                            <span>{user.role}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className="status-dot active">Active</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .user-cell { display: flex; align-items: center; gap: 1rem; }
        .avatar { width: 40px; height: 40px; border-radius: 9999px; background: var(--border-highlight); display: flex; align-items: center; justify-content: center; color: var(--text-dim); overflow: hidden; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .info { display: flex; flex-direction: column; }
        .info strong { color: var(--text-main); }
        .info span { font-size: 0.75rem; color: var(--text-dim); }
        .role-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
        .role-badge.admin { background: rgba(139, 92, 246, 0.1); color: var(--accent); border: 1px solid rgba(139, 92, 246, 0.2); }
        .role-badge.user { background: var(--border-highlight); color: var(--text-muted); }
        .status-dot { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--success); }
        .status-dot::before { content: ''; width: 8px; height: 8px; background: var(--success); border-radius: 50%; }
        .loading, .empty { padding: 4rem; text-align: center; color: var(--text-dim); }
      `}</style>
        </div>
    );
};

export default Users;
