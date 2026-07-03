import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'WA_InventoryManager')) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/logo.png" alt="Stenna Logo" className="login-logo" />
                    <h1>WA Inventory Portal</h1>
                    <p>Enter your credentials to access the inventory dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                type="email"
                                placeholder="Enter Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <Button type="submit" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                    </Button>
                </form>

                <div className="login-footer">
                    <p>&copy; 2026 Stenna. Internal Access Only.</p>
                </div>
            </div>

            <style>{`
                .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; padding: 1.5rem; }
                .login-card { width: 100%; max-width: 440px; background: #1e293b; border: 1px solid #334155; border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .login-header { text-align: center; margin-bottom: 2.5rem; display: flex; flex-direction: column; align-items: center; }
                .login-logo { height: 48px; width: auto; object-fit: contain; margin-bottom: 1.5rem; }
                h1 { font-size: 1.5rem; color: white; font-weight: 700; margin-bottom: 0.5rem; }
                p { color: #94a3b8; font-size: 0.875rem; }
                .login-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .input-group label { display: block; color: #94a3b8; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .input-with-icon :global(svg) { position: absolute; left: 1rem; color: #64748b; }
                .input-with-icon input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 0.75rem; padding: 0.75rem 1rem 0.75rem 3rem; color: white; outline: none; transition: border-color 0.2s; }
                .input-with-icon input:focus { border-color: #2563eb; }
                .login-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.875rem; border: 1px solid rgba(239, 68, 68, 0.2); }
                .login-btn { background: #2563eb; color: white; border: none; padding: 0.875rem; border-radius: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
                .login-btn:hover { background: #1d4ed8; }
                .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .login-footer { margin-top: 2.5rem; text-align: center; color: #475569; font-size: 0.75rem; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 480px) {
                  .login-card { padding: 1.5rem; border-radius: 1rem; }
                  .login-header { margin-bottom: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Login;
