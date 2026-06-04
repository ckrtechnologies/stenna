import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import MyQueries from '../pages/MyQueries';
import Profile from '../pages/Profile';
import TryItOn from '../pages/TryItOn';
import AiRecommendations from '../pages/AiRecommendations';
import WallpaperDetail from '../pages/WallpaperDetail';
import Showcase from '../pages/Showcase';
import ProtectedRoute from '../components/ProtectedRoute';
import About from '../pages/About';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';
import InstallationGuide from '../pages/InstallationGuide';

import PrivacyPolicy from '../pages/PrivacyPolicy';
import RefundPolicy from '../pages/RefundPolicy';
import ReturnPolicy from '../pages/ReturnPolicy';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/wallpaper/:slug" element={<WallpaperDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/installation-guide" element={<InstallationGuide />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />

            {/* Protected Routes */}
            <Route path="/catalog" element={<Catalog />} />
            <Route
                path="/my-queries"
                element={
                    <ProtectedRoute>
                        <MyQueries />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile/enquiries"
                element={
                    <ProtectedRoute>
                        <MyQueries />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/try-it-on"
                element={
                    <ProtectedRoute>
                        <TryItOn />
                    </ProtectedRoute>
                }
            />
            <Route path="/ai-recommendations" element={<AiRecommendations />} />
        </Routes>
    );
};

export default AppRoutes;
