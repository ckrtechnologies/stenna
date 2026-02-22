import React, { useState, useEffect } from 'react';
import { fetchWallpapers } from '../services/api';
import ProductNavigator from '../components/ProductNavigator';
import { Loader2 } from 'lucide-react';

const Showcase = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                // Fetch a curated set of wallpapers for the showcase
                const data = await fetchWallpapers({ activeOnly: true });
                // Take top 10 for the exclusive navigator feel
                setProducts(data.slice(0, 10));
            } catch (err) {
                console.error("Error loading showcase products:", err);
                setError("Failed to load exclusive collection.");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
            }}>
                <Loader2 className="animate-spin" size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.6 }}>
                    Initializing Immersive Archive
                </p>
            </div>
        );
    }

    if (error || products.length === 0) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#fff'
            }}>
                <p>{error || "No products found for showcase."}</p>
            </div>
        );
    }

    return (
        <div className="showcase-page">
            <ProductNavigator products={products} />
        </div>
    );
};

export default Showcase;
