import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Image as ImageIcon,
    Layers,
    TrendingUp,
    RefreshCw,
    UserCheck,
    Book
} from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

const StatCard = ({ title, value, icon, color, path }) => (
    <Link to={path} className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={`icon-box ${color}`}>{icon}</div>
        <div className="stat-info">
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    </Link>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        wallpapers: 0,
        categories: 0,
        leads: 0,
        dealers: 0,
        books: 0,
        topWallpaper: 'None'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/dashboard-stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's an overview of your store.</p>
                </div>
                <button className="btn btn-primary" onClick={fetchStats}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Stats</span>
                </button>
            </header>

            <div className="stats-grid">
                <StatCard
                    title="Wallpapers"
                    value={stats.wallpapers}
                    icon={<ImageIcon size={24} />}
                    color="blue"
                    path="/wallpapers"
                />
                <StatCard
                    title="Categories"
                    value={stats.categories}
                    icon={<Layers size={24} />}
                    color="purple"
                    path="/categories"
                />
                <StatCard
                    title="Total Leads"
                    value={stats.leads}
                    icon={<Users size={24} />}
                    color="green"
                    path="/leads"
                />
                <StatCard
                    title="Active Dealers"
                    value={stats.dealers}
                    icon={<UserCheck size={24} />}
                    color="indigo"
                    path="/dealers"
                />
                <StatCard
                    title="Books"
                    value={stats.books}
                    icon={<Book size={24} />}
                    color="pink"
                    path="/books"
                />
                {/* <StatCard
                    title="Top Wallpaper"
                    value={stats.topWallpaper}
                    icon={<TrendingUp size={24} />}
                    color="orange"
                    path="/wallpapers"
                /> */}
            </div>

            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
