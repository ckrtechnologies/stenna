import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminRoutes from './routes/AdminRoutes';

function App() {
    return (
        <AuthProvider>
            <Router>
                <AdminRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
