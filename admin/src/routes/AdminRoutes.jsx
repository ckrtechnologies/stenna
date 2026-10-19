import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute'; // Ensure this path is correct relative to the new file
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Wallpapers from '../pages/Wallpapers';
import Categories from '../pages/Categories';
import CategoryGroups from '../pages/CategoryGroups';
import Leads from '../pages/Leads';
import Users from '../pages/Users';
import Store from '../pages/Store';
import Dealers from '../pages/Dealers';
import Books from '../pages/Books';
import DealerBooks from '../pages/DealerBooks';
import BookWallpapers from '../pages/BookWallpapers';
import InventoryManagement from '../pages/InventoryManagement';
import ImageEnhancer from '../pages/ContentCreation/ImageEnhancer';
import GeneratePDF from '../pages/GeneratePDF';
import SalesDashboard from '../pages/SalesDashboard';
import Vendors from '../pages/Vendors';
import Zones from '../pages/Zones';
import Markets from '../pages/Markets';
import SalesBoys from '../pages/SalesBoys';
import VisitRecords from '../pages/VisitRecords';
import ShopHistoryLedger from '../pages/ShopHistoryLedger';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/wallpapers" element={<ProtectedRoute><Wallpapers /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><CategoryGroups /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/content/image-enhancer" element={<ProtectedRoute><ImageEnhancer /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            <Route path="/dealers" element={<ProtectedRoute><Dealers /></ProtectedRoute>} />
            <Route path="/dealers/:id/books" element={<ProtectedRoute><DealerBooks /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
            <Route path="/books/:id/wallpapers" element={<ProtectedRoute><BookWallpapers /></ProtectedRoute>} />
            <Route path="/generate-pdf" element={<ProtectedRoute><GeneratePDF /></ProtectedRoute>} />

            {/* Sales Tracking & Field Management Routes */}
            <Route path="/sales-tracking/dashboard" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
            <Route path="/sales-tracking/zones" element={<ProtectedRoute><Zones /></ProtectedRoute>} />
            <Route path="/sales-tracking/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
            <Route path="/sales-tracking/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
            <Route path="/sales-tracking/shop-history" element={<ProtectedRoute><ShopHistoryLedger /></ProtectedRoute>} />
            <Route path="/sales-tracking/sales-boys" element={<ProtectedRoute><SalesBoys /></ProtectedRoute>} />
            <Route path="/sales-tracking/visits" element={<ProtectedRoute><VisitRecords /></ProtectedRoute>} />
        </Routes>
    );
};

export default AdminRoutes;
